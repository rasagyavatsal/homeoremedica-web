# HomeoRemedica RAG chat

This package supplies the Python backend and terminal client for grounded chat over the immutable
HomeoRemedica corpus. It does not deploy infrastructure or expose the private SQLite artifacts.

## How it works

1. `sync` reads `corpora/active.json` from `homeoremedica-private-remedies` in the
   `homeoremedica` project.
2. The cache follows exact object generations and verifies pointer, manifest, and artifact sizes,
   SHA-256 digests, schemas, compatibility metadata, and SQLite integrity before activation.
3. Each question gets a `gemini-embedding-001` `RETRIEVAL_QUERY` embedding with the dimensions
   declared by that corpus release.
4. FTS5 and `sqlite-vec` search every selected book locally and merge candidates with
   reciprocal-rank fusion.
5. `gemini-2.5-flash-lite` answers only from the eight highest-ranked excerpts. The response
   carries immutable source IDs in `corpusVersion/bookId/chunkId` form.

The system instruction treats source text as untrusted data, requires numbered citations, and
prevents diagnosis, prescribing, dosage advice, and delayed professional care. This is a safety
boundary, not a substitute for clinical review.

## Commands

Run commands from the repository root:

```sh
npm run rag:sync
npm run rag -- ask "How is Nux vomica described?"
npm run rag:chat
npm run rag:serve
```

`sync`, `ask`, `chat`, and `serve` check Cloud Storage for the active release by default. Add the
global `--cached` option before the command to work from the last verified cache:

```sh
npm run rag -- --cached ask "How is Nux vomica described?"
```

Use repeatable `--book` options after `ask` or `chat` to restrict retrieval. Valid current IDs are
`allen-nosodes`, `boericke-MM`, `clarke-MM`, and `kent-lectures`.

The server exposes:

- `GET /health`
- `POST /v1/chat` with `message`, optional `history`, and optional `bookIds`
- interactive OpenAPI documentation at `/docs`

Run all Python-only checks with:

```sh
uv run --project rag --locked ruff check --config rag/pyproject.toml rag
uv run --project rag --locked pyright --project rag
uv run --project rag --locked pytest rag/tests
```

The root `lint`, `typecheck`, and `test` scripts include these checks.

## Configuration

Settings use the `RAG_` prefix. Defaults target the required GCP project and active corpus:

| Variable | Default |
| --- | --- |
| `RAG_PROJECT` | `homeoremedica` |
| `RAG_LOCATION` | `us-central1` |
| `RAG_BUCKET` | `homeoremedica-private-remedies` |
| `RAG_CORPUS_PREFIX` | `corpora` |
| `RAG_CACHE_DIR` | `server-data/rag-corpus` |
| `RAG_MODEL` | `gemini-2.5-flash-lite` |
| `RAG_MAX_OUTPUT_TOKENS` | `700` |

Application Default Credentials need Storage object-viewer access to the private bucket and
Vertex AI prediction access in `homeoremedica`.

## Cost estimate

Pricing checked on 2026-08-15 against the official
[Vertex AI pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing) and
[Cloud Storage pricing](https://cloud.google.com/storage/pricing) pages:

- The current four-book corpus is 142,368,768 bytes (about 0.133 GiB). A full first download to
  India is at most about **$0.016** at the listed $0.12/GiB internet transfer rate, plus fractions
  of a cent for Class B reads. The us-central1 free tier can make this $0. Cached runs do not
  download book files again.
- Gemini Embedding online input is $0.00015 per 1,000 input tokens. A roughly 100-token retrieval
  query costs about **$0.000015**.
- Gemini 2.5 Flash-Lite is $0.10 per million input tokens and $0.40 per million output tokens. A
  representative 5,000-token grounded prompt plus the configured 700-token maximum response is
  about **$0.00078**, including the query embedding—less than one tenth of a cent per chat.

Actual cost varies with conversation and excerpt length. No GCP resources are created by these
commands; only Storage reads and Vertex AI inference are used.
