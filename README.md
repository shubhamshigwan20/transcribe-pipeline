# Transcribe Pipeline

A full-stack, queue-based audio transcription system that demonstrates API design, background processing, and cloud-style integrations. It uses Redis + BullMQ for job orchestration, a Node.js worker for audio preprocessing, and a Whisper-style transcription API, with results stored in Postgres.

This repo is structured like a small production service: a producer API for ingest, a consumer API for log access, a worker for processing, and a frontend for submissions and visibility.

**Architecture Overview**

1. **Producer API** (`producer-service`)
   - Express server with `POST /transcribe`.
   - Enqueues transcription jobs into Redis via BullMQ.

2. **Consumer API** (`consumer-service`)
   - Express server with log endpoints for the frontend.
   - Reads status and transcripts from Postgres.

3. **Worker Process** (`consumer-worker`)
   - BullMQ worker that listens to the `transcribe-queue`.
   - Downloads MP3, converts to WAV (mono, 16 kHz) using ffmpeg.
   - Sends WAV to a Whisper-style API (`WHISPER_API`).
   - Updates Postgres with status and transcript text.

4. **Frontend** (`frontend`)
   - Vite + React app.
   - Submits URLs, lists jobs, and shows full transcripts.

---

**Data Flow**

1. Client sends `{ "url": "<mp3 url>" }` to `POST /transcribe` on the producer.
2. The URL is added to `transcribe-queue` in Redis.
3. Worker processes the job: download -> convert -> transcribe -> store.
4. Worker updates a `logs` table in Postgres with `status` and `transcript`.
5. Frontend reads logs and transcripts from the consumer API.

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

**API Endpoints**

Producer API (port 3000)

- `POST /transcribe`
  - Body: `{ "url": "<mp3 url>" }`
  - Enqueues a job

Consumer API (port 4000)

- `GET /logs`
  - Returns array of `{ url, status }`
- `POST /logs`
  - Same response as GET, kept for compatibility
- `GET /logs/text?url=<encoded url>`
  - Returns `{ transcript }`

Health

- `GET /health` on producer and consumer for service checks

---

**Frontend Routes**

- `/` Submit a presigned MP3 URL and enqueue a job
- `/dashboard` View logs in a table
- `/text` View full transcript for a selected URL

---

**Database Schema (Required)**

The worker and API assume a `logs` table with at least these columns:

```sql
CREATE TABLE IF NOT EXISTS logs (
  url TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  transcript TEXT
);
```

Status values written by the worker today are: `queued`, `start`, and `complete`.

---

**Environment Variables**

Producer

- `PORT`
- `REDIS_URL`

Consumer / Worker

- `PORT`
- `REDIS_URL`
- `WHISPER_API`
- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE` (optional)
- `PGCHANNELBINDING` (optional)

Frontend

- `VITE_PRODUCER_API_BASE` (default `http://localhost:3000`)
- `VITE_CONSUMER_API_BASE` (default `http://localhost:4000`)

---

**Run Locally (Docker Compose)**

```bash
docker compose up --build
```

Ports

- Producer: `3000`
- Consumer: `4000`
- Frontend: `5173`
- Redis: `6379`

---

**Tech Stack**

- Node.js + Express
- Redis + BullMQ
- ffmpeg (audio processing)
- Postgres (Neon compatible)
- Vite + React
- Docker Compose
