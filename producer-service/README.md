# Producer Service

The producer service is the public ingest API. It accepts an MP3 URL, validates the payload, and enqueues a job into Redis via BullMQ.

---

**Endpoints**

- `GET /` basic status
- `GET /health` health status
- `POST /transcribe`
  - Body: `{ "url": "<mp3 url>" }`
  - Response: `{ status: true, message: "job <id> added to queue" }`

---

**Environment Variables**

- `PORT` (default `3000`)
- `REDIS_URL`

---

**Run Locally**

```bash
npm install
npm run dev
```

Or run everything from the root:

```bash
docker compose up --build
```
