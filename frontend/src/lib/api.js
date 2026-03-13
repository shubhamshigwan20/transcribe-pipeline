const ingestBaseUrl =
  import.meta.env.VITE_PRODUCER_API_BASE || "http://localhost:3000";
const logsBaseUrl =
  import.meta.env.VITE_CONSUMER_API_BASE || "http://localhost:4000";

const buildUrl = (base, path) => {
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function postTranscribe(url) {
  const response = await fetch(buildUrl(ingestBaseUrl, "/transcribe"), {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to enqueue transcription job");
  }

  return response.json();
}

export async function fetchLogs() {
  const response = await fetch(buildUrl(logsBaseUrl, "/logs"));
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch logs");
  }
  return response.json();
}

export async function fetchTranscript(url) {
  const response = await fetch(
    buildUrl(logsBaseUrl, `/logs/text?url=${encodeURIComponent(url)}`),
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to fetch transcript");
  }
  return response.json();
}

export { ingestBaseUrl, logsBaseUrl };
