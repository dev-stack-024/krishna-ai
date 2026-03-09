from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import requests
import json
from fastapi.responses import JSONResponse, StreamingResponse
from guardrails import Guard
from guardrails.hub import RestrictToTopic, ToxicLanguage
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
MODEL = os.getenv("MODEL", "llama3.1:8b")

# Request schema
class GenerateRequest(BaseModel):
    prompt: str



# Define safety guard for prompt injections / toxic inputs
toxic_guard = Guard().use(
    ToxicLanguage(threshold=0.8, validation_method="sentence", pass_on_invalid=True)
)

# Optional: Ensure output stays on tech/general topics for chat
# topic_guard = Guard().use(RestrictToTopic(valid_topics=["technology", "programming", "general assistance"]))

@app.get("/")
def home():
    return {"message": "AI Platform Running with Guardrails"}


# Unified generation endpoint
@app.post("/generate")
def generate(req: GenerateRequest):
    try:
        toxic_guard.validate(req.prompt)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Input violates safety guidelines (toxicity/abuse detected).")

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
