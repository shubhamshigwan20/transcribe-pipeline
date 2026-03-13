# Consumer Service

The consumer service exposes API routes for logs and transcript text. It also shares the same codebase with the worker process (`worker.js`), which performs audio processing and writes results to Postgres.

---

**API Endpoints**

- `GET /` basic status
- `GET /health` health status
- `POST /transcribe` enqueue a job (same as producer)
- `GET /logs` return `{ url, status }` rows
- `POST /logs` same response as GET
- `GET /logs/text?url=<encoded url>` return `{ transcript }`

---

**Worker Responsibilities**

1. Wait for jobs in `transcribe-queue`.
2. Download MP3 and convert to WAV (mono, 16 kHz).
3. Send WAV to `WHISPER_API`.
4. Update Postgres logs with status and transcript text.

Status values written by the worker: `queued`, `start`, `complete`.

---

**Database Schema (Required)**

```sql
CREATE TABLE IF NOT EXISTS logs (
  url TEXT PRIMARY KEY,
  status TEXT NOT NULL,
  transcript TEXT
);
```

---

**Environment Variables**

- `PORT` (default `4000`)
- `REDIS_URL`
- `WHISPER_API`
- `PGHOST`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`
- `PGSSLMODE` (optional)
- `PGCHANNELBINDING` (optional)

---

**Run Locally**

```bash
npm install
npm run dev
```

Worker process:

```bash
node worker.js
```

Or run everything from the root:

```bash
docker compose up --build
```
