from __future__ import annotations

import hashlib
import json
import sqlite3
from pathlib import Path

import sqlite_vec
from homeoremedica_chat.corpus import CorpusCache, ObjectData


class MemorySource:
    def __init__(self, objects: dict[tuple[str, int | None], ObjectData]) -> None:
        self.objects = objects

    def read(self, name: str, *, generation: int | None = None) -> ObjectData:
        return self.objects[name, generation]


def test_sync_opens_a_verified_release_and_searches_its_hybrid_index(tmp_path: Path) -> None:
    artifact = _artifact_bytes(tmp_path)
    artifact_digest = hashlib.sha256(artifact).hexdigest()
    manifest = _json_bytes({
        "artifactSchemaVersion": 1,
        "books": [
            {
                "author": "James Tyler Kent",
                "bookId": "kent-lectures",
                "byteSize": len(artifact),
                "chunkCount": 2,
                "generation": 22,
                "object": "corpora/v1/books/kent-lectures.sqlite",
                "passageCount": 2,
                "sha256": artifact_digest,
                "sourceSha256": "a" * 64,
                "title": "Kent's Lectures",
            }
        ],
        "compatibility": {
            "distanceFunction": "cosine",
            "documentTaskType": "RETRIEVAL_DOCUMENT",
            "embeddingDimensions": 3,
            "embeddingModel": "gemini-embedding-001",
            "embeddingNormalization": "l2",
            "modelInputLimit": 2048,
            "queryTaskType": "RETRIEVAL_QUERY",
            "sqliteVecVersion": "0.1.9",
            "sqliteVersion": sqlite3.sqlite_version,
        },
        "corpusHash": "b" * 64,
        "corpusVersion": "v1",
        "evaluation": {
            "chosenDimensions": 3,
            "corpusHash": "b" * 64,
            "datasetSha256": "c" * 64,
            "datasetVersion": "test",
            "metric": "recallAtK",
            "resultSha256": "d" * 64,
            "threshold": 0.8,
            "value": 1.0,
        },
        "manifestSchemaVersion": 1,
    })
    pointer = _json_bytes({
        "corpusVersion": "v1",
        "manifestByteSize": len(manifest),
        "manifestGeneration": 11,
        "manifestObject": "corpora/v1/manifest.json",
        "manifestSha256": hashlib.sha256(manifest).hexdigest(),
        "pointerSchemaVersion": 1,
    })
    source = MemorySource({
        ("corpora/active.json", None): ObjectData(
            name="corpora/active.json", generation=10, content=pointer
        ),
        ("corpora/v1/manifest.json", 11): ObjectData(
            name="corpora/v1/manifest.json", generation=11, content=manifest
        ),
        ("corpora/v1/books/kent-lectures.sqlite", 22): ObjectData(
            name="corpora/v1/books/kent-lectures.sqlite", generation=22, content=artifact
        ),
    })

    release = CorpusCache(tmp_path / "cache").sync(source)
    results = release.search("irritability", (1.0, 0.0, 0.0), book_ids=None, limit=1)

    assert release.corpus_version == "v1"
    assert results[0].chunk_id == "chunk-irritable"
    assert results[0].remedy_name == "NUX VOMICA"
    assert (tmp_path / "cache/v1/books/kent-lectures.sqlite").read_bytes() == artifact


def _artifact_bytes(tmp_path: Path) -> bytes:
    path = tmp_path / "book.sqlite"
    connection = sqlite3.connect(path)
    connection.enable_load_extension(True)
    sqlite_vec.load(connection)
    connection.enable_load_extension(False)
    connection.executescript(
        """
        CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL) WITHOUT ROWID;
        CREATE TABLE chunks (
            rowid INTEGER PRIMARY KEY,
            id TEXT NOT NULL UNIQUE,
            book_id TEXT NOT NULL,
            remedy_slug TEXT NOT NULL,
            remedy_name TEXT NOT NULL,
            section_slug TEXT NOT NULL,
            section_title TEXT NOT NULL,
            passage_indexes TEXT NOT NULL,
            part INTEGER NOT NULL,
            text TEXT NOT NULL
        );
        CREATE VIRTUAL TABLE chunks_fts USING fts5(
            text, remedy_name, section_title, content='chunks', content_rowid='rowid',
            tokenize='porter unicode61 remove_diacritics 2'
        );
        CREATE VIRTUAL TABLE chunk_vectors USING vec0(
            chunk_rowid INTEGER PRIMARY KEY,
            embedding float[3] distance_metric=cosine
        );
        """
    )
    rows = (
        (
            1,
            "chunk-irritable",
            "nux-vomica",
            "NUX VOMICA",
            "mind",
            "MIND",
            "Irritable and oversensitive.",
            (1.0, 0.0, 0.0),
        ),
        (
            2,
            "chunk-calm",
            "pulsatilla",
            "PULSATILLA",
            "mind",
            "MIND",
            "Mild and yielding disposition.",
            (0.0, 1.0, 0.0),
        ),
    )
    for rowid, chunk_id, remedy_slug, remedy_name, section_slug, section, text, vector in rows:
        connection.execute(
            "INSERT INTO chunks VALUES (?, ?, 'kent-lectures', ?, ?, ?, ?, '[0]', 1, ?)",
            (rowid, chunk_id, remedy_slug, remedy_name, section_slug, section, text),
        )
        connection.execute(
            "INSERT INTO chunk_vectors(chunk_rowid, embedding) VALUES (?, ?)",
            (rowid, sqlite_vec.serialize_float32(vector)),
        )
    connection.execute("INSERT INTO chunks_fts(chunks_fts) VALUES ('rebuild')")
    metadata = {
        "artifact_schema_version": "1",
        "book_author": "James Tyler Kent",
        "book_id": "kent-lectures",
        "book_title": "Kent's Lectures",
        "chunk_count": "2",
        "corpus_hash": "b" * 64,
        "corpus_version": "v1",
        "distance_function": "cosine",
        "document_task_type": "RETRIEVAL_DOCUMENT",
        "embedding_dimensions": "3",
        "embedding_model": "gemini-embedding-001",
        "embedding_normalization": "l2",
        "fts_tokenizer": "porter unicode61 remove_diacritics 2",
        "model_input_limit": "2048",
        "passage_count": "2",
        "query_task_type": "RETRIEVAL_QUERY",
        "source_sha256": "a" * 64,
        "sqlite_vec_version": "0.1.9",
        "sqlite_version": sqlite3.sqlite_version,
    }
    connection.executemany("INSERT INTO metadata VALUES (?, ?)", metadata.items())
    connection.commit()
    connection.close()
    return path.read_bytes()


def _json_bytes(value: object) -> bytes:
    return (json.dumps(value, separators=(",", ":"), sort_keys=True) + "\n").encode()
