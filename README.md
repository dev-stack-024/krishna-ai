# AI Platform - Production Ready

A minimal, production-style AI platform you can run locally with Docker, then deploy to your server unchanged.

## Features

- **Ollama** - Local LLM management
- **FastAPI** - High-performance AI API
- **Chat Endpoint** - General conversation with Mistral
- **Code Endpoint** - Code generation with QWen 2.5 Coder
- **Embeddings Endpoint** - Vector embeddings with Nomic Embed Text
- **Docker Compose** - Complete containerized setup
- **Scalable** - Ready for RAG and agents

## Architecture

```
React UI
  │
  ▼
AI API (FastAPI)
  │
  ▼
Ollama
 ├─ mistral (chat)
 ├─ qwen2.5-coder:7b (code)
 └─ nomic-embed-text (embeddings)
```

## Quick Start

### 1. Run Containers

```bash
docker compose up --build
```

### 2. Pull Models

After containers start:

```bash
docker exec -it ollama ollama pull mistral
docker exec -it ollama ollama pull qwen2.5-coder:7b
docker exec -it ollama ollama pull nomic-embed-text
```

### 3. Test the API

**Chat Endpoint:**
```bash
curl http://localhost:8000/chat \
  -d "prompt=Explain Node.js event loop"
```

**Code Model:**
```bash
curl http://localhost:8000/code \
  -d "prompt=Write a React file upload component"
```

**Embeddings:**
```bash
curl http://localhost:8000/embedding \
  -d "text=AI systems architecture"
```

## API Endpoints

### GET `/`
Health check

**Response:**
```json
{
  "message": "AI Platform Running"
}
```

### POST `/chat`
General conversation

**Parameters:**
- `prompt` (string): The message to send

**Model:** Mistral

### POST `/code`
Code generation

**Parameters:**
- `prompt` (string): Code generation request

**Model:** QWen 2.5 Coder 7B

### POST `/embedding`
Generate embeddings

**Parameters:**
- `text` (string): Text to embed

**Model:** Nomic Embed Text

## Project Structure

```
ai-platform/
├── docker-compose.yml
├── api/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## Next Steps

- Add RAG (Retrieval Augmented Generation)
- Add agents
- Add authentication
- Add caching
- Deploy to production server

## Notes

- Keep models the same locally and on server
- Docker ensures reproducibility
- All containers communicate via docker network
- Ollama data persists in named volume
