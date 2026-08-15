from __future__ import annotations

import math
from collections.abc import Sequence
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

from google import genai
from google.genai import types
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from homeoremedica_chat.chat import ChatService
from homeoremedica_chat.corpus import CorpusCache, CorpusRelease, GoogleCloudCorpusSource


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="RAG_", extra="ignore")

    project: str = "homeoremedica"
    location: str = "us-central1"
    bucket: str = "homeoremedica-private-remedies"
    corpus_prefix: str = "corpora"
    cache_dir: Path = Path("server-data/rag-corpus")
    model: str = "gemini-2.5-flash-lite"
    max_output_tokens: int = Field(default=700, gt=0, le=4_096)
    allowed_origins: str = ""

    @field_validator("allowed_origins")
    @classmethod
    def validate_allowed_origins(cls, value: str) -> str:
        origins = tuple(
            origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()
        )
        for origin in origins:
            parsed = urlsplit(origin)
            if (
                parsed.scheme not in {"http", "https"}
                or not parsed.netloc
                or parsed.path
                or parsed.query
                or parsed.fragment
                or parsed.username
                or parsed.password
            ):
                raise ValueError(f"invalid allowed origin: {origin}")
        return ",".join(origins)

    @property
    def cors_origins(self) -> tuple[str, ...]:
        return tuple(self.allowed_origins.split(",")) if self.allowed_origins else ()


class VertexChatModel:
    """Hide the two Vertex AI operations and their safety-oriented generation controls."""

    def __init__(
        self,
        *,
        project: str,
        location: str,
        model: str,
        max_output_tokens: int,
        client: Any | None = None,
    ) -> None:
        self.model = model
        self._max_output_tokens = max_output_tokens
        self._client = client or genai.Client(
            vertexai=True,
            project=project,
            location=location,
        )

    def embed_query(self, text: str, *, dimensions: int, task_type: str) -> tuple[float, ...]:
        response = self._client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(
                task_type=task_type,
                output_dimensionality=dimensions,
                auto_truncate=False,
            ),
        )
        embeddings = response.embeddings or []
        if len(embeddings) != 1:
            raise RuntimeError(f"Vertex AI returned {len(embeddings)} query embeddings")
        result = embeddings[0]
        if result.statistics is not None and result.statistics.truncated:
            raise RuntimeError("Vertex AI truncated the retrieval query")
        return _normalize(result.values or (), dimensions)

    def generate(self, prompt: str, *, system_instruction: str) -> str:
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.2,
                max_output_tokens=self._max_output_tokens,
                automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True),
            ),
        )
        if not response.text or not response.text.strip():
            raise RuntimeError("Vertex AI returned an empty chat response")
        return response.text


def build_service(settings: Settings, *, sync: bool = True) -> ChatService:
    cache = CorpusCache(settings.cache_dir, prefix=settings.corpus_prefix)
    corpus = sync_corpus(settings) if sync else cache.open_cached()
    model = VertexChatModel(
        project=settings.project,
        location=settings.location,
        model=settings.model,
        max_output_tokens=settings.max_output_tokens,
    )
    return ChatService(
        corpus=corpus,
        model=model,
        embedding_dimensions=corpus.embedding_dimensions,
        query_task_type=corpus.query_task_type,
    )


def sync_corpus(settings: Settings) -> CorpusRelease:
    return CorpusCache(settings.cache_dir, prefix=settings.corpus_prefix).sync(
        GoogleCloudCorpusSource(settings.bucket, project=settings.project)
    )


def _normalize(values: Sequence[float], dimensions: int) -> tuple[float, ...]:
    if len(values) != dimensions:
        raise RuntimeError(
            f"Vertex AI returned {len(values)} embedding dimensions; expected {dimensions}"
        )
    norm = math.sqrt(math.fsum(float(value) ** 2 for value in values))
    if norm == 0 or not math.isfinite(norm):
        raise RuntimeError("Vertex AI returned a zero or non-finite query embedding")
    return tuple(float(value) / norm for value in values)
