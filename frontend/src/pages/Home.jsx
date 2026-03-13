import React, { useState } from "react";
import { postTranscribe } from "../lib/api.js";

const Home = () => {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setStatus("error");
      setMessage("Please add a presigned MP3 URL to continue.");
      return;
    }

    try {
      setStatus("loading");
      setMessage("Submitting job to the queue...");
      const response = await postTranscribe(trimmed);
      setStatus("success");
      setMessage(response?.message || "Job queued successfully.");
      setUrl("");
    } catch (error) {
      setStatus("error");
      setMessage(error?.message || "Failed to submit job.");
    }
  };

  return (
    <section className="page">
      <div className="hero">
        <div>
          <p className="eyebrow">Queue-Based Transcription</p>
          <h1>Submit an MP3 and let the pipeline handle the rest.</h1>
          <p className="lead">
            Paste a presigned MP3 URL and we will enqueue it for preprocessing,
            transcription, and storage.
          </p>
        </div>
        <div className="hero-card">
          <form onSubmit={handleSubmit} className="form">
            <label htmlFor="mp3Url">Presigned MP3 URL</label>
            <input
              id="mp3Url"
              type="url"
              placeholder="https://storage.example.com/file.mp3?signature=..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
            />
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Send to /transcribe"}
            </button>
          </form>
          <div className={`status-box ${status}`}>
            <span className="status-title">Submission status</span>
            <span className="status-message">
              {message || "Waiting for a URL."}
            </span>
          </div>
        </div>
      </div>
      <div className="info-grid">
        <div className="info-card">
          <h3>What happens next?</h3>
          <p>Redis stores the job, the worker converts it to WAV, then the
            transcript is pushed to Postgres.</p>
        </div>
        <div className="info-card">
          <h3>Where to check?</h3>
          <p>Visit the dashboard to see pipeline status and open any log to
            read the full transcript.</p>
        </div>
      </div>
    </section>
  );
};

export default Home;
