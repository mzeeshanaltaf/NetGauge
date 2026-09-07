import { ThroughputSampler } from "./download";
import type { DataPlane, ThroughputProgress, ThroughputResult, UploadMeasurementConfig } from "./types";

export const DEFAULT_UPLOAD_CONFIG: UploadMeasurementConfig = {
  parallelStreams: 6,
  warmupMs: 2000,
  measureMs: 8000,
  // Uplinks are typically far slower than downlinks — start smaller.
  initialBytesPerStream: 4 * 1024 * 1024,
  maxBytesPerStream: 64 * 1024 * 1024,
  requestTargetMs: 3000,
};

/** crypto.getRandomValues caps at 65536 bytes per call, so fill in chunks. */
async function generateRandomBlob(size: number): Promise<Blob> {
  const chunkSize = 65536;
  const parts: BlobPart[] = [];
  let remaining = size;
  while (remaining > 0) {
    const n = Math.min(chunkSize, remaining);
    const chunk = new Uint8Array(new ArrayBuffer(n));
    crypto.getRandomValues(chunk);
    parts.push(chunk);
    remaining -= n;
  }
  return new Blob(parts, { type: "application/octet-stream" });
}

export async function measureUpload(
  dataPlane: DataPlane,
  config: UploadMeasurementConfig = DEFAULT_UPLOAD_CONFIG,
  onProgress?: (progress: ThroughputProgress) => void,
  externalSignal?: AbortSignal
): Promise<ThroughputResult> {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  const startTime = performance.now();
  const totalWindowMs = config.warmupMs + config.measureMs;
  const sampler = new ThroughputSampler(startTime);
  const sourceBlob = await generateRandomBlob(config.maxBytesPerStream);
  let bytesPerStream = Math.min(config.initialBytesPerStream, config.maxBytesPerStream);

  async function runStream(): Promise<void> {
    while (performance.now() - startTime < totalWindowMs && !controller.signal.aborted) {
      const blob = sourceBlob.slice(0, bytesPerStream);
      const requestStart = performance.now();
      try {
        await dataPlane.upload(blob, (delta, ts) => sampler.add(delta, ts), controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return;
        throw err;
      }
      const elapsed = performance.now() - requestStart;
      if (elapsed < config.requestTargetMs && bytesPerStream < config.maxBytesPerStream) {
        bytesPerStream = Math.min(bytesPerStream * 2, config.maxBytesPerStream);
      }
    }
  }

  const progressTimer = onProgress
    ? setInterval(() => {
        const t = performance.now() - startTime;
        onProgress({ elapsedMs: t, mbpsNow: sampler.instantaneousMbps(t), bytesTransferred: sampler.totalBytes });
      }, 200)
    : undefined;
  const windowTimeout = setTimeout(() => controller.abort(), totalWindowMs);

  try {
    await Promise.all(Array.from({ length: config.parallelStreams }, () => runStream()));
  } finally {
    clearTimeout(windowTimeout);
    if (progressTimer !== undefined) clearInterval(progressTimer);
    externalSignal?.removeEventListener("abort", onExternalAbort);
  }

  return sampler.result(config.warmupMs);
}
