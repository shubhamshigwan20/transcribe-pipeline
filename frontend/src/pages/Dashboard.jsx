import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchLogs } from "../lib/api.js";

const normalizeLogs = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.logs)) return payload.logs;
  return [];
};

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const refreshLogs = async () => {
    try {
      setStatus("loading");
      setError("");
      const data = await fetchLogs();
      setLogs(normalizeLogs(data));
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Failed to load logs.");
    }
  };

  useEffect(() => {
    refreshLogs();
  }, []);

  const summary = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        const key = (log.status || "unknown").toLowerCase();
        acc[key] = (acc[key] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 },
    );
  }, [logs]);

  const handleRowClick = (log) => {
    const targetUrl = log.url || log.audio_url || log.source_url;
    if (!targetUrl) return;
    navigate(`/text?url=${encodeURIComponent(targetUrl)}`);
  };

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Pipeline Dashboard</p>
          <h1>Track every job across the pipeline.</h1>
        </div>
        <button className="ghost" onClick={refreshLogs} disabled={status === "loading"}>
          {status === "loading" ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="summary">
        <div className="summary-card">
          <span>Total jobs</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card">
          <span>Queued</span>
          <strong>{summary.queued || 0}</strong>
        </div>
        <div className="summary-card">
          <span>Processing</span>
          <strong>{summary.processing || 0}</strong>
        </div>
        <div className="summary-card">
          <span>Completed</span>
          <strong>{summary.completed || 0}</strong>
        </div>
      </div>

      {status === "error" && <div className="status-box error">{error}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Audio URL</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && status !== "loading" && (
              <tr>
                <td colSpan={3} className="empty">No logs yet. Submit a job first.</td>
              </tr>
            )}
            {logs.map((log, index) => {
              const url = log.url || log.audio_url || log.source_url || "Unknown";
              const statusValue = log.status || "unknown";
              const updated = log.updated_at || log.updatedAt || log.timestamp || "-";
              return (
                <tr
                  key={`${url}-${index}`}
                  onClick={() => handleRowClick(log)}
                  className="clickable"
                >
                  <td title={url}>{url}</td>
                  <td>
                    <span className={`pill ${statusValue.toLowerCase()}`}>
                      {statusValue}
                    </span>
                  </td>
                  <td>{updated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
