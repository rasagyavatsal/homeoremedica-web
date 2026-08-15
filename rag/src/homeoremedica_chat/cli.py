from __future__ import annotations

import argparse
import sys
from collections.abc import Sequence
from pathlib import Path

import uvicorn

from homeoremedica_chat.api import create_app
from homeoremedica_chat.chat import ChatRequest, ChatResponse, ChatTurn
from homeoremedica_chat.corpus import CorpusError
from homeoremedica_chat.runtime import Settings, build_service, sync_corpus


def main(argv: Sequence[str] | None = None) -> int:
    parser = _parser()
    args = parser.parse_args(argv)
    settings = _settings(args)
    try:
        if args.command == "sync":
            corpus = sync_corpus(settings)
            print(
                f"Cached corpus {corpus.corpus_version} "
                f"({len(corpus.book_ids)} books) in {settings.cache_dir}"
            )
            return 0

        service = build_service(settings, sync=not args.cached)
        if args.command == "ask":
            response = service.chat(
                ChatRequest(
                    message=args.message,
                    book_ids=tuple(args.books) if args.books else None,
                )
            )
            _print_response(response)
            return 0
        if args.command == "chat":
            return _interactive(service, tuple(args.books) if args.books else None)
        if args.command == "serve":
            uvicorn.run(
                create_app(service),
                host=args.host,
                port=args.port,
                log_level=args.log_level,
            )
            return 0
    except (CorpusError, RuntimeError, ValueError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    parser.error(f"unsupported command: {args.command}")
    return 2


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="homeoremedica-chat",
        description="Sync, test, and serve the HomeoRemedica grounded chat backend.",
    )
    parser.add_argument("--project", help="GCP project (default: homeoremedica)")
    parser.add_argument("--location", help="Vertex AI region (default: us-central1)")
    parser.add_argument("--bucket", help="private corpus bucket")
    parser.add_argument("--cache-dir", type=Path, help="local verified corpus cache")
    parser.add_argument(
        "--cached",
        action="store_true",
        help="use the existing verified cache without checking Cloud Storage",
    )
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("sync", help="download and verify the active corpus release")

    ask = commands.add_parser("ask", help="ask one question")
    ask.add_argument("message")
    _book_filter(ask)

    chat = commands.add_parser("chat", help="start an interactive terminal conversation")
    _book_filter(chat)

    serve = commands.add_parser("serve", help="run the HTTP API")
    serve.add_argument("--host", default="127.0.0.1")
    serve.add_argument("--port", type=int, default=8000)
    serve.add_argument("--log-level", default="info")
    return parser


def _book_filter(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--book",
        dest="books",
        action="append",
        help="limit retrieval to a book ID; repeat for multiple books",
    )


def _settings(args: argparse.Namespace) -> Settings:
    settings = Settings()
    overrides = {
        key: value
        for key, value in {
            "project": args.project,
            "location": args.location,
            "bucket": args.bucket,
            "cache_dir": args.cache_dir,
        }.items()
        if value is not None
    }
    return settings.model_copy(update=overrides)


def _interactive(service, book_ids: tuple[str, ...] | None) -> int:
    history: list[ChatTurn] = []
    print("HomeoRemedica chat. Type /exit to leave or /clear to reset the conversation.")
    while True:
        try:
            message = input("\nYou: ").strip()
        except EOFError:
            print()
            return 0
        if message in {"/exit", "/quit"}:
            return 0
        if message == "/clear":
            history.clear()
            print("Conversation cleared.")
            continue
        if not message:
            continue
        response = service.chat(
            ChatRequest(message=message, history=tuple(history), book_ids=book_ids)
        )
        print("\nAssistant: ", end="")
        _print_response(response)
        history.extend((
            ChatTurn(role="user", content=message),
            ChatTurn(role="assistant", content=response.answer),
        ))


def _print_response(response: ChatResponse) -> None:
    print(response.answer)
    print(f"\nSources (corpus {response.corpus_version}):")
    for index, source in enumerate(response.sources, start=1):
        print(f"[{index}] {source.book_title} — {source.remedy_name} — {source.section_title}")
        print(f"    {source.id}")


if __name__ == "__main__":
    raise SystemExit(main())
