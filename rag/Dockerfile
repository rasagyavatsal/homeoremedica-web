FROM python:3.14-slim-trixie

COPY --from=ghcr.io/astral-sh/uv:0.11.32 /uv /uvx /bin/

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-install-project --no-build

COPY src ./src

ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONPATH=/app/src \
    RAG_CACHE_DIR=/tmp/homeoremedica-rag-corpus

RUN groupadd --system --gid 10001 homeoremedica \
    && useradd --system --uid 10001 --gid homeoremedica --no-create-home homeoremedica

USER homeoremedica

EXPOSE 8080

CMD ["uvicorn", "homeoremedica_chat.api:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers", "--forwarded-allow-ips", "*"]
