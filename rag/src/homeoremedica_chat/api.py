from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Protocol

from fastapi import FastAPI, HTTPException, Request

from homeoremedica_chat.chat import ChatRequest, ChatResponse, Contract
from homeoremedica_chat.runtime import Settings, build_service


class ChatBackend(Protocol):
    @property
    def corpus_version(self) -> str: ...

    @property
    def model_name(self) -> str: ...

    def chat(self, request: ChatRequest) -> ChatResponse: ...


class HealthResponse(Contract):
    status: str
    corpus_version: str
    model: str


def create_app(
    service: ChatBackend | None = None,
    *,
    settings: Settings | None = None,
) -> FastAPI:
    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        if service is None:
            application.state.chat_service = await asyncio.to_thread(
                build_service, settings or Settings()
            )
        else:
            application.state.chat_service = service
        yield

    application = FastAPI(
        title="HomeoRemedica RAG Chat API",
        version="1.0.0",
        lifespan=lifespan,
    )
    if service is not None:
        application.state.chat_service = service

    @application.get("/health", response_model=HealthResponse)
    async def health(request: Request) -> HealthResponse:
        backend = _service(request)
        return HealthResponse(
            status="ok",
            corpus_version=backend.corpus_version,
            model=backend.model_name,
        )

    @application.post("/v1/chat", response_model=ChatResponse)
    async def chat(chat_request: ChatRequest, request: Request) -> ChatResponse:
        try:
            return await asyncio.to_thread(_service(request).chat, chat_request)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    return application


def _service(request: Request) -> ChatBackend:
    return request.app.state.chat_service


app = create_app()
