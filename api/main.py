from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

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


@app.get("/")
def home():
    return {"message": "AI Platform Running"}


# Chat endpoint
@app.post("/chat")
def chat(prompt: str):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()


# Coding endpoint
@app.post("/code")
def code(prompt: str):

    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "qwen2.5-coder:7b",
            "prompt": prompt,
            "stream": False
        }
    )

    return response.json()


# Embedding endpoint
@app.post("/embedding")
def embedding(text: str):

    response = requests.post(
        EMBED_URL,
        json={
            "model": "nomic-embed-text",
            "prompt": text
        }
    )

    return response.json()
