from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import httpx
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
MODEL = os.getenv("MODEL", "qwen2.5:7b-instruct")

class GenerateRequest(BaseModel):
    prompt: str


@app.get("/")
def home():
    return {"message": "AI Platform Running"}


@app.post("/generate")
async def generate(req: GenerateRequest):
    async def stream():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                OLLAMA_URL,
                json={"model": MODEL, "prompt": req.prompt, "stream": True},
            ) as response:
                async for chunk in response.aiter_bytes(chunk_size=1024):
                    if chunk:
                        yield chunk

    return StreamingResponse(stream(), media_type="application/x-ndjson")


@app.get("/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get("http://ollama:11434/api/tags")
        models = set([m.get("name") for m in r.json().get("models", [])])
        missing = list({MODEL} - models)
        return {"ok": True, "missing_models": missing, "models": list(models)}
    except Exception as e:
        return JSONResponse(status_code=500, content={"ok": False, "error": str(e)})
