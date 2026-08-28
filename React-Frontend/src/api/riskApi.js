const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function jsonOrThrow(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok && res.status !== 404) {
    throw new Error(data?.detail || `Request failed: ${res.status}`);
  }
  return { status: res.status, data };
}

/** POST /api/risk/analyse -> { job_id } (202) */
export async function submitAnalysis({ latitude, longitude }) {
  const res = await fetch(`${BASE_URL}/api/risk/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ latitude, longitude }),
  });
  const { data } = await jsonOrThrow(res);
  return data.job_id;
}

/** GET /api/status/:jobId -> { status: pending|completed|error, result } */
export async function getStatus(jobId) {
  const res = await fetch(`${BASE_URL}/api/status/${jobId}`);
  const { data } = await jsonOrThrow(res);
  return data;
}

/** Poll status until completed/error, or timeout. onTick optional progress callback. */
export async function pollUntilComplete(jobId, { interval = 10000, timeout = 100000, onTick } = {}) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    await new Promise((r) => setTimeout(r, interval));
    const { status, result } = await getStatus(jobId);
    onTick?.(status);
    if (status === "completed") return result;
    if (status === "error") throw new Error(result || "Job failed");
  }
  throw new Error("Polling timed out");
}

/** POST /api/risk/simulate -> { result } (200) or 404 "Job not found" */
export async function simulateGreenery({ jobId, pctGreenery }) {
  const res = await fetch(`${BASE_URL}/api/risk/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ job_id: jobId, pct_greenery: pctGreenery }),
  });
  if (res.status === 404) throw new Error("Job not found — re-run analysis for this site");
  const { data } = await jsonOrThrow(res);
  return data.result;
}

/** Full flow: submit -> poll -> return result */
export async function analyseSite({ latitude, longitude }, opts) {
  const jobId = await submitAnalysis({ latitude, longitude });
  const result = await pollUntilComplete(jobId, opts);
  return { jobId, result };
}
