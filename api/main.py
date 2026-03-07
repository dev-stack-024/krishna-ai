from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
from fastapi.responses import JSONResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://ollama:11434/api/generate"
EMBED_URL = "http://ollama:11434/api/embeddings"
CHAT_MODEL = os.getenv("CHAT_MODEL", "mistral")
CODE_MODEL = os.getenv("CODE_MODEL", "qwen2.5-coder:7b")
EMBED_MODEL = os.getenv("EMBED_MODEL", "nomic-embed-text")


@app.get("/")
def home():
    return {"message": "AI Platform Running"}


# Chat endpoint
@app.post("/chat")
def chat(prompt: str):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": CHAT_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    if response.ok:
        return response.json()
    return JSONResponse(status_code=response.status_code, content={"error": "ollama_error", "detail": response.text})


# Coding endpoint
@app.post("/code")
def code(prompt: str):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": CODE_MODEL,
            "prompt": prompt,
            "stream": False
        }
    )

    if response.ok:
        return response.json()
    return JSONResponse(status_code=response.status_code, content={"error": "ollama_error", "detail": response.text})


# Embedding endpoint
@app.post("/embedding")
def embedding(text: str):

    response = requests.post(
        EMBED_URL,
        json={
            "model": EMBED_MODEL,
            "prompt": text
        }
    )

    if response.ok:
        return response.json()
    return JSONResponse(status_code=response.status_code, content={"error": "ollama_error", "detail": response.text})

@app.get("/health")
def health():
    try:
        r = requests.get("http://ollama:11434/api/tags", timeout=5)
        models = set([m.get("name") for m in r.json().get("models", [])])
        required = {CHAT_MODEL, CODE_MODEL, EMBED_MODEL}
        missing = list(required - models)
        return {"ok": True, "missing_models": missing, "models": list(models)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})
