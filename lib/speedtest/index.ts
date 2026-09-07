import { DEFAULT_DOWNLOAD_CONFIG, measureDownload } from "./download";
import { gradeBufferbloat } from "./grade";
import { measureIdleLatency, measureLoadedLatency } from "./latency";
import { DEFAULT_UPLOAD_CONFIG, measureUpload } from "./upload";
import { computeVerdicts } from "./verdicts";
import type { DataPlane, SpeedTestConfig, SpeedTestProgress, SpeedTestResult } from "./types";

export const DEFAULT_CONFIG: SpeedTestConfig = {
  idleLatencySamples: 20,
  loadedLatencyIntervalMs: 200,
  download: DEFAULT_DOWNLOAD_CONFIG,
  upload: DEFAULT_UPLOAD_CONFIG,
};

// The Worker's rate limiter is per-IP, so a real user can hit it (rerunning
// the test repeatedly, or a busy embed host) — give it a message worth
// reading instead of a bare status code.
function describeFailure(status: number, action: string): string {
  if (status === 429) return "You're testing too frequently. Wait a minute and try again.";
  return `${action} failed: ${status}`;
}

/** Default DataPlane implementation: the netgauge Cloudflare Worker. */
export class CloudflareDataPlane implements DataPlane {
  constructor(private readonly baseUrl: string) {}

  private url(path: string, extraParams: Record<string, string> = {}): string {
    const url = new URL(path, this.baseUrl);
    // Cache-bust every request — a cached response would report fake speeds.
    url.searchParams.set("i", crypto.randomUUID());
    for (const [key, value] of Object.entries(extraParams)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }

  async ping(signal?: AbortSignal): Promise<number> {
    const start = performance.now();
    const res = await fetch(this.url("/ping"), { cache: "no-store", signal });
    const end = performance.now();
    if (!res.ok) throw new Error(describeFailure(res.status, "ping"));
    return end - start;
  }

  async download(bytes: number, onChunk: (deltaBytes: number, timestampMs: number) => void, signal: AbortSignal): Promise<void> {
    const res = await fetch(this.url("/download", { bytes: String(bytes) }), { cache: "no-store", signal });
    if (!res.ok || !res.body) throw new Error(describeFailure(res.status, "download"));

    const reader = res.body.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.byteLength > 0) onChunk(value.byteLength, performance.now());
      }
    } catch (err) {
      if (signal.aborted) return;
      throw err;
    } finally {
      try {
        reader.releaseLock();
      } catch {
        // already released via cancellation
      }
    }
  }

  upload(blob: Blob, onChunk: (deltaBytes: number, timestampMs: number) => void, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", this.url("/upload"));
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      let lastLoaded = 0;
      xhr.upload.onprogress = (event) => {
        const delta = event.loaded - lastLoaded;
        lastLoaded = event.loaded;
        if (delta > 0) onChunk(delta, performance.now());
      };

      xhr.onload = () => {
        if (xhr.status === 204 || xhr.status === 200) resolve();
        else reject(new Error(describeFailure(xhr.status, "upload")));
      };
      xhr.onerror = () => reject(new Error("upload network error"));

      const onAbort = () => xhr.abort();
      xhr.onabort = () => {
        signal.removeEventListener("abort", onAbort);
        resolve();
      };
      signal.addEventListener("abort", onAbort);

      xhr.send(blob);
    });
  }
}

export async function runSpeedTest(
  dataPlane: DataPlane,
  onProgress: (event: SpeedTestProgress) => void = () => {},
  config: SpeedTestConfig = DEFAULT_CONFIG
): Promise<SpeedTestResult> {
  const idleLatency = await measureIdleLatency(dataPlane, config.idleLatencySamples, (rtt, i) =>
    onProgress({ phase: "idle-latency", sampleIndex: i, sampleCount: config.idleLatencySamples, latestRttMs: rtt })
  );

  const downloadProbeAbort = new AbortController();
  const loadedDownProbe = measureLoadedLatency(dataPlane, downloadProbeAbort.signal, config.loadedLatencyIntervalMs, (rtt) =>
    onProgress({ phase: "loaded-latency-down", latestRttMs: rtt })
  );
  const download = await measureDownload(dataPlane, config.download, (progress) => onProgress({ phase: "download", ...progress }));
  downloadProbeAbort.abort();
  const loadedLatencyDown = await loadedDownProbe;

  const uploadProbeAbort = new AbortController();
  const loadedUpProbe = measureLoadedLatency(dataPlane, uploadProbeAbort.signal, config.loadedLatencyIntervalMs, (rtt) =>
    onProgress({ phase: "loaded-latency-up", latestRttMs: rtt })
  );
  const upload = await measureUpload(dataPlane, config.upload, (progress) => onProgress({ phase: "upload", ...progress }));
  uploadProbeAbort.abort();
  const loadedLatencyUp = await loadedUpProbe;

  const addedLatencyMs = Math.max(loadedLatencyDown.latencyMs, loadedLatencyUp.latencyMs) - idleLatency.latencyMs;
  const grade = gradeBufferbloat(addedLatencyMs);

  const result: SpeedTestResult = {
    idleLatency,
    download,
    loadedLatencyDown,
    upload,
    loadedLatencyUp,
    bufferbloat: { addedLatencyMs, grade },
    verdicts: computeVerdicts({ idleLatency, download, upload, bufferbloatGrade: grade }),
  };

  onProgress({ phase: "done", result });
  return result;
}

export * from "./types";
export { gradeBufferbloat, gradeAtLeast } from "./grade";
export { computeVerdicts } from "./verdicts";
export { measureIdleLatency, measureLoadedLatency, median, meanAbsoluteConsecutiveDiff } from "./latency";
export { measureDownload, DEFAULT_DOWNLOAD_CONFIG, ThroughputSampler } from "./download";
export { measureUpload, DEFAULT_UPLOAD_CONFIG } from "./upload";
