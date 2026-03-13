import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchTranscript } from "../lib/api.js";

const Text = () => {
  const [searchParams] = useSearchParams();
  const url = searchParams.get("url") || "";
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    const loadTranscript = async () => {
      if (!url) return;
      try {
        setStatus("loading");
        setError("");
        const data = await fetchTranscript(url);
        const text = data?.transcript || data?.text || data?.data || "";
        setTranscript(text || "No transcript returned.");
        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err?.message || "Failed to load transcript.");
      }
    };

    loadTranscript();
  }, [url]);

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Transcript Viewer</p>
          <h1>Full transcription text.</h1>
          <p className="lead">Source URL: <span className="mono">{url || "No URL provided"}</span></p>
        </div>
        <Link to="/dashboard" className="ghost">Back to dashboard</Link>
      </div>

      {!url && (
        <div className="status-box error">
          No URL was provided. Please open a job from the dashboard.
        </div>
      )}

      {status === "error" && <div className="status-box error">{error}</div>}

      <div className="transcript-card">
        {status === "loading" && <p>Loading transcript...</p>}
        {status !== "loading" && <pre>{transcript}</pre>}
      </div>
    </section>
  );
};

export default Text;
