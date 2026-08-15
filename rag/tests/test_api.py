from fastapi.testclient import TestClient
from homeoremedica_chat.api import create_app
from homeoremedica_chat.chat import ChatRequest, ChatResponse, Citation


class StubService:
    corpus_version = "v1"
    model_name = "test-model"

    def chat(self, request: ChatRequest) -> ChatResponse:
        assert request.message == "What is described?"
        assert request.book_ids == ("kent-lectures",)
        return ChatResponse(
            answer="A grounded answer [1].",
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
                    text="Source text.",
                ),
            ),
        )


def test_chat_endpoint_exposes_the_frontend_contract_in_camel_case() -> None:
    client = TestClient(create_app(StubService()))

    response = client.post(
        "/v1/chat",
        json={"message": "What is described?", "bookIds": ["kent-lectures"]},
    )

    assert response.status_code == 200
    assert response.json() == {
        "answer": "A grounded answer [1].",
        "corpusVersion": "v1",
        "model": "test-model",
        "sources": [
            {
                "id": "v1/kent-lectures/chunk-1",
                "bookId": "kent-lectures",
                "bookTitle": "Kent's Lectures",
                "author": "James Tyler Kent",
                "remedyName": "NUX VOMICA",
                "sectionTitle": "MIND",
                "passageIndexes": [0],
                "text": "Source text.",
            }
        ],
    }
    assert client.get("/health").json() == {
        "status": "ok",
        "corpusVersion": "v1",
        "model": "test-model",
    }
