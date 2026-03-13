# Frontend

The frontend is a Vite + React application for submitting transcription jobs and viewing pipeline status.

---

**Routes**

- `/` Submit a presigned MP3 URL to `/transcribe` on the producer API.
- `/dashboard` View log rows in a table.
- `/text` View the full transcript for a selected URL.

---

**Environment Variables**

- `VITE_PRODUCER_API_BASE` (default `http://localhost:3000`)
- `VITE_CONSUMER_API_BASE` (default `http://localhost:4000`)

Create a local `.env` file or use the provided example:

```bash
cp .env.example .env
```

---

**Run Locally**

```bash
npm install
npm run dev
```

The dev server runs on port `5173` by default.
