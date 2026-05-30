# n8n + PixVerse CLI + local Ollama (docker-compose)

## 1) Prereqs
- Docker + Docker Compose
- Ollama running on your machine (default: `http://localhost:11434`)

## 2) Start n8n
```bash
docker compose up -d --build n8n
```
Open n8n: http://localhost:5678

Inside n8n, call Ollama using:
```
{{$env.OLLAMA_BASE_URL}}
```
(set in `docker-compose.yml`)

## 3) PixVerse CLI

### Option A — PixVerse CLI **inside n8n** (recommended)
`n8n.Dockerfile` installs `pixverse` into the n8n image.

In n8n, use an **Execute Command** node:
```bash
pixverse auth login
```
Then (example):
```bash
pixverse create video --prompt "A minimal white studio product ad..." --model v6 --quality 720p --aspect-ratio 16:9 --json
```

### Option B — PixVerse CLI as a separate container (profile `tools`)
```bash
docker compose --profile tools run --rm pixverse auth login
docker compose --profile tools run --rm pixverse create video --prompt "..." --model v6 --quality 720p --aspect-ratio 16:9 --json
```

Both containers share `shared_data` mounted at `/data/shared`.

## 4) Local Ollama notes
The compose maps `host.docker.internal` to your host (Linux: `host-gateway`), so from containers:
```
http://host.docker.internal:11434
```
