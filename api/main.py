from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_URL = "http://ollama:11434/api/generate"
MODEL = os.getenv("MODEL", "qwen2.5:14b")
# MODEL = os.getenv("MODEL", "llama3.1:8b")

# Request schema
class GenerateRequest(BaseModel):
    prompt: str



@app.get("/")
def home():
    return {"message": "AI Platform Running"}


# Unified generation endpoint
@app.post("/generate")
def generate(req: GenerateRequest):
    def stream():
        response = requests.post(
            OLLAMA_URL,
            json={"model": MODEL, "prompt": req.prompt, "stream": True},
            stream=True
        )
        for chunk in response.iter_content(chunk_size=1024):
            if chunk:
                yield chunk

    return StreamingResponse(stream(), media_type="application/x-ndjson")


@app.get("/health")
def health():
    try:
        r = requests.get("http://ollama:11434/api/tags", timeout=5)
        models = set([m.get("name") for m in r.json().get("models", [])])
        required = {MODEL}
        missing = list(required - models)
        return {"ok": True, "missing_models": missing, "models": list(models)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})
