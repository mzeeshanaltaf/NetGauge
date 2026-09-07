import type { DataPlane, LatencySample } from "./types";

export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function meanAbsoluteConsecutiveDiff(values: number[]): number {
  if (values.length < 2) return 0;
  let sum = 0;
  for (let i = 1; i < values.length; i++) {
    sum += Math.abs(values[i] - values[i - 1]);
  }
  return sum / (values.length - 1);
}

function summarize(samples: number[]): LatencySample {
  return { latencyMs: median(samples), jitterMs: meanAbsoluteConsecutiveDiff(samples), samples };
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal?.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      resolve();
    }
    signal?.addEventListener("abort", onAbort);
  });
}

/** ~20 sequential /ping requests, idle (no concurrent load). */
export async function measureIdleLatency(
  dataPlane: DataPlane,
  sampleCount: number,
  onSample?: (rtt: number, index: number) => void
): Promise<LatencySample> {
  const samples: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    const rtt = await dataPlane.ping();
    samples.push(rtt);
    onSample?.(rtt, i);
  }
  return summarize(samples);
}

/**
 * Fires /ping probes back-to-back until `signal` aborts, for use
 * concurrently with a saturating download or upload.
 */
export async function measureLoadedLatency(
  dataPlane: DataPlane,
  signal: AbortSignal,
  intervalMs: number,
  onSample?: (rtt: number) => void
): Promise<LatencySample> {
  const samples: number[] = [];
  while (!signal.aborted) {
    try {
      const rtt = await dataPlane.ping(signal);
      samples.push(rtt);
      onSample?.(rtt);
    } catch (err) {
      if (signal.aborted) break;
      throw err;
    }
    await sleep(intervalMs, signal);
  }
  return summarize(samples);
}
