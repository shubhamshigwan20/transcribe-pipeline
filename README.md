# Transcribe Pipeline

A full‑stack, queue‑based audio transcription system that demonstrates API design, background processing, and cloud‑style integrations. It uses Redis + BullMQ for job orchestration, a Node.js worker for audio preprocessing, and a Whisper‑style transcription API, with results stored in Postgres.

This repo is structured the way a small production service would be: a producer API for ingest, a consumer/worker for processing, and a frontend (currently a stub) that can be expanded into a complete UI.

**Architecture Overview**

1. **Producer API** (`producer-service`)
   - Express server with `POST /transcribe`.
   - Validates a URL payload and enqueues a job in Redis via BullMQ.

2. **Consumer API** (`consumer-service`)
   - Express server also exposing `POST /transcribe`.
   - Shares queue logic and can be used as an internal or public ingest service.

3. **Worker Process** (`consumer-worker`)
   - Dedicated BullMQ worker that listens to the `transcribe-queue`.
   - Downloads MP3 files, converts them to WAV (mono, 16 kHz) using ffmpeg.
   - Sends the WAV file to a Whisper‑style API (`WHISPER_API`).
   - Writes status and transcripts into Postgres.

4. **Frontend** (`frontend`)
   - Vite + React app (currently a minimal stub).
   - Intended as the client UI for submitting URLs and viewing transcripts.

---

**Data Flow**

1. Client sends `{ "url": "<mp3 url>" }` to `POST /transcribe`.
2. The URL is added to `transcribe-queue` in Redis.
3. Worker processes the job:
   - `download → convert → transcribe → store`
4. Worker updates a `logs` table in Postgres with `status` and `transcript`.

---

**Project Structure**

- `producer-service/`
  - `index.js`: Express app
  - `controllers/controllers.js`: BullMQ enqueue
- `consumer-service/`
  - `index.js`: Express app
  - `worker.js`: BullMQ worker + audio pipeline
  - `db/db.js`: Postgres connection
- `frontend/`: Vite + React app
- `docker-compose.yml`: orchestrates all services

---

**Endpoints**

- `GET /` → basic status
- `GET /health` → health status
- `POST /transcribe` → enqueue a transcription job

Example:

```bash
curl -X POST http://localhost:3000/transcribe \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://example.com/audio.mp3\"}"
```

---

**Environment Variables**

Producer:

- `PORT`
- `REDIS_URL`

Consumer/Worker:

- `PORT`
- `REDIS_URL`
- `WHISPER_API`
- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE`
- `PGCHANNELBINDING`

---

---

**Run Locally**

```bash
docker compose up --build
```

Ports:

- Producer: `3000`
- Consumer: `4000`
- Frontend: `5173`

---

**Tech Stack**

- Node.js + Express
- Redis + BullMQ
- ffmpeg (audio processing)
- Postgres (Neon compatible)
- Vite + React
- Docker Compose
