import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";

import { API_URL } from "../config.js";

const Research = () => {
  const [topic, setTopic] = useState("");
  const [taskId, setTaskId] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loadingLatest, setLoadingLatest] = useState(false);

  const statusLabel = useMemo(() => {
    if (status === "idle") return "Idle";
    if (status === "queued") return "Queued";
    if (status === "running") return "Running";
    if (status === "complete") return "Complete";
    if (status === "error") return "Error";
    return status;
  }, [status]);

  const pollStatus = useCallback(async (id) => {
    try {
      const response = await axios.get(`${API_URL}/research/status/${id}`);
      const nextStatus = response.data?.status ?? "unknown";
      setStatus(nextStatus);

      if (nextStatus === "complete") {
        setResult(response.data?.result ?? null);
        return true;
      }

      if (nextStatus === "error") {
        setError(response.data?.error ?? "Research failed.");
        return true;
      }
    } catch (pollError) {
      setError(pollError?.message ?? "Unable to fetch task status.");
      return true;
    }

    return false;
  }, []);

  const startResearch = async (event) => {
    event.preventDefault();
    if (!topic.trim()) {
      setError("Research topic is required.");
      return;
    }

    setError("");
    setResult(null);
    setStatus("queued");

    try {
      const topicValue = topic.trim();
      const response = await axios.post(`${API_URL}/research/refresh`, {
        topic_id: topicValue,
        query: topicValue,
      });

      const newTaskId = response.data?.task_id;
      setTaskId(newTaskId);
      setStatus(response.data?.status ?? "queued");

      if (!newTaskId) {
        throw new Error("No task id returned from backend.");
      }
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError?.response?.data?.detail ||
          requestError?.message ||
          "Failed to start research task."
      );
    }
  };

  const loadLatest = async () => {
    if (!topic.trim()) {
      setError("Research topic is required to load results.");
      return;
    }

    setLoadingLatest(true);
    setError("");

    try {
      const response = await axios.get(`${API_URL}/research/${topic.trim()}`);
      setResult({
        summary: response.data?.summary ?? "",
        sources: response.data?.sources ?? [],
      });
    } catch (fetchError) {
      setError(
        fetchError?.response?.data?.detail ||
          fetchError?.message ||
          "No stored research found."
      );
    } finally {
      setLoadingLatest(false);
    }
  };

  useEffect(() => {
    if (!taskId) return undefined;

    let cancelled = false;
    const interval = setInterval(async () => {
      if (cancelled) return;
      const done = await pollStatus(taskId);
      if (done) {
        clearInterval(interval);
      }
    }, 1500);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pollStatus, taskId]);

  const sources = result?.sources ?? [];

  return (
    <section style={{ maxWidth: 920 }}>
      <h2>Deep Research</h2>
      <p style={{ color: "#4b5563" }}>
        Kick off a deep research task through Parallel.ai and store the results
        in MongoDB. Track the status and load the latest saved research for any
        topic.
      </p>

      <form
        onSubmit={startResearch}
        style={{
          display: "grid",
          gap: 12,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fafafa",
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Research topic</span>
          <input
            type="text"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. HVAC industry M&A trends"
            style={{ padding: 10, borderRadius: 8, border: "1px solid #d1d5db" }}
          />
        </label>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="submit" style={{ padding: "10px 16px" }}>
            Start research
          </button>
          <button
            type="button"
            onClick={loadLatest}
            disabled={loadingLatest}
            style={{ padding: "10px 16px" }}
          >
            {loadingLatest ? "Loading..." : "Load latest"}
          </button>
          <span>Status: {statusLabel}</span>
          {taskId ? <span>Task: {taskId.slice(0, 8)}...</span> : null}
        </div>
      </form>

      {error ? (
        <p style={{ color: "#b91c1c", marginTop: 12 }}>{error}</p>
      ) : null}

      <div
        style={{
          marginTop: 20,
          padding: 16,
          border: "1px solid #e5e7eb",
          borderRadius: 12,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Summary</h3>
        <p style={{ color: "#1f2937" }}>
          {result?.summary ? result.summary : "No summary yet."}
        </p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Sources</h3>
        {sources.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No sources yet.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {sources.map((source, index) => (
              <li key={`${source.url}-${index}`} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>{source.title || "Untitled"}</div>
                {source.url ? (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.url}
                  </a>
                ) : null}
                {source.snippet ? (
                  <div style={{ color: "#4b5563" }}>{source.snippet}</div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Research;
