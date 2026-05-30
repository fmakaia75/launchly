# Launchly — AI Product Launch Studio

Turn a product brief into a full launch campaign in minutes. Type a name, description, and audience — get LinkedIn posts and a PixVerse-ready video prompt, generated locally with Ollama and orchestrated by n8n.

---

## What it does

1. You fill in a short brief on the web app (product name, description, target audience)
2. The form hits an n8n webhook
3. n8n runs two parallel Ollama agents:
   - **AI PROMPT FOR SOCIAL** → 3 LinkedIn posts (announcement, framework, call for testers)
   - **SCRIPT CONTENT** → a PixVerse video prompt + negative prompt
4. Results come back to you — copy the posts, paste the prompt into PixVerse CLI

---

## Stack

| Layer | Tool |
|---|---|
| Frontend | Next.js 14 + Tailwind CSS |
| Automation | n8n (self-hosted, Docker) |
| AI model | Ollama (`gemma4:e2b` locally) |
| Video generation | PixVerse CLI |
| Container runtime | Docker Compose |

---

## Project structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── studio/page.tsx       # Form page (/studio)
│   │   ├── results/[jobId]/      # Results polling page
│   │   └── api/n8n-webhook/      # Server-side proxy to n8n
│   └── components/studio/
│       └── Studio.tsx            # Main form component
├── public/
│   └── hero.mp4                  # Landing page demo video
└── src/build/
    ├── docker-compose.yml        # n8n container
    └── workflows/
        └── My_workflow.json      # n8n workflow (auto-imported on start)
```

---

## Getting started

### 1. Prerequisites

- [Node.js](https://nodejs.org) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop) or [OrbStack](https://orbstack.dev) (recommended on Apple Silicon)
- [Ollama](https://ollama.ai) running locally
- [PixVerse CLI](https://docs.pixverse.ai/cli) installed on your machine

### 2. Pull the Ollama model

```bash
ollama pull gemma4:e2b
```

### 3. Start n8n

```bash
cd src/build
docker compose up -d n8n
```

n8n will start at `http://localhost:5678` and auto-import the workflow from `workflows/My_workflow.json`.

> **After first launch:** open n8n, go to the imported workflow, and reconnect the **Ollama credentials** in both Ollama Chat Model nodes (Settings → Credentials → Ollama account → `http://host.docker.internal:11434`).

### 4. Start the web app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Using the app

1. Go to `http://localhost:3000/studio`
2. Fill in the form and click **Generate Campaign**
3. n8n triggers Ollama — wait for the agents to finish
4. Copy the LinkedIn posts and PixVerse prompt from n8n's output

### Running the video prompt with PixVerse CLI

```bash
pixverse auth login   # one-time

pixverse create video \
  --prompt "paste the generated prompt here" \
  --model v4.5 \
  --quality 540p \
  --aspect-ratio 16:9 \
  --duration 5
```

---

## Environment variables

Create a `.env.local` file at the project root to override defaults:

```bash
# Webhook called when the form is submitted
NEXT_PUBLIC_N8N_START_WEBHOOK_URL=http://localhost:5678/webhook/pixverse-launch

# Webhook polled on /results/<jobId>
NEXT_PUBLIC_N8N_RESULT_WEBHOOK_URL=http://localhost:5678/webhook/pixverse-result

# Landing page hero video (local file or direct MP4/embed URL)
NEXT_PUBLIC_HERO_VIDEO_URL=/hero.mp4
```

---

## n8n workflow overview

```
Webhook (POST)
  ├── AI PROMPT FOR SOCIAL  ←  Ollama (gemma4:e2b)
  │     └── Merge
  └── SCRIPT CONTENT        ←  Ollama (gemma4:e2b)
        └── Code (parse prompt/negative_prompt)
              └── PixVerse API (optional)
```

The workflow JSON lives at `src/build/workflows/My_workflow.json` and is imported automatically when n8n starts. Re-export from n8n and replace this file to update it.

> **Note:** The PixVerse API node is included but optional — use the CLI instead if you don't have API access.

---

## Docker details

The `src/build/docker-compose.yml` runs n8n with:
- Port `5678` exposed to localhost
- Ollama reachable at `http://host.docker.internal:11434`
- Workflow files mounted at `/workflows` (read-only)
- CORS enabled for local development

```bash
# Start
cd src/build && docker compose up -d n8n

# Stop
cd src/build && docker compose down

# Logs
cd src/build && docker compose logs -f n8n
```

---

## Deployment

The web app can be deployed to Vercel:

1. Import the repo on [vercel.com](https://vercel.com)
2. Set the environment variables in the Vercel dashboard
3. Point `NEXT_PUBLIC_N8N_START_WEBHOOK_URL` to your hosted n8n instance

n8n can be self-hosted on any VPS — [n8n.io/self-hosted](https://n8n.io/self-hosted).
