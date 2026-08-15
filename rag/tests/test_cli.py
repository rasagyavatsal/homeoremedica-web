from homeoremedica_chat import cli
from homeoremedica_chat.chat import ChatRequest, ChatResponse, Citation


class StubService:
    def chat(self, request: ChatRequest) -> ChatResponse:
        assert request.message == "What is Nux vomica associated with?"
        return ChatResponse(
            answer=(
                "Historical materia medica reference only—not medical advice. "
                "For health decisions, consult a qualified clinician.\n\n"
                "The excerpt describes irritability [1]."
            ),
            corpus_version="v1",
            model="test-model",
            sources=(
                Citation(
                    id="v1/kent-lectures/chunk-1",
                    book_id="kent-lectures",
                    book_title="Kent's Lectures",
                    author="James Tyler Kent",
                    remedy_name="NUX VOMICA",
                    section_title="MIND",
                    passage_indexes=(0,),
                    text="Irritable.",
                ),
            ),
        )


def test_ask_command_prints_the_answer_and_traceable_sources(monkeypatch, capsys) -> None:
    monkeypatch.setattr(cli, "build_service", lambda settings, sync: StubService())

    exit_code = cli.main(["--cached", "ask", "What is Nux vomica associated with?"])

    assert exit_code == 0
    assert capsys.readouterr().out == (
        "Historical materia medica reference only—not medical advice. "
        "For health decisions, consult a qualified clinician.\n\n"
        "The excerpt describes irritability [1].\n\n"
        "Sources (corpus v1):\n"
        "[1] Kent's Lectures — NUX VOMICA — MIND\n"
        "    v1/kent-lectures/chunk-1\n"
    )
