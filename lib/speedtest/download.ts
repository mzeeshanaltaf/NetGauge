import type { DataPlane, DownloadMeasurementConfig, ThroughputProgress, ThroughputResult } from "./types";

export const DEFAULT_DOWNLOAD_CONFIG: DownloadMeasurementConfig = {
  parallelStreams: 6,
  warmupMs: 2000,
  measureMs: 8000,
  initialBytesPerStream: 10 * 1024 * 1024,
  maxBytesPerStream: 200 * 1024 * 1024,
  requestTargetMs: 3000,
};

/**
 * Tracks cumulative bytes over time and derives throughput while discarding
 * the TCP-slow-start warm-up window via linear interpolation of the sample
 * straddling `warmupMs`.
 */
export class ThroughputSampler {
  private readonly startTime: number;
  private readonly samples: { t: number; bytes: number }[];
  private cumulativeBytes = 0;

  constructor(startTime: number) {
    this.startTime = startTime;
    this.samples = [{ t: 0, bytes: 0 }];
  }

  add(deltaBytes: number, timestampMs: number): void {
    this.cumulativeBytes += deltaBytes;
    this.samples.push({ t: timestampMs - this.startTime, bytes: this.cumulativeBytes });
  }

  get totalBytes(): number {
    return this.cumulativeBytes;
  }

  /** Throughput in Mbps over the trailing `windowMs`, as of elapsed time `nowT`. */
  instantaneousMbps(nowT: number, windowMs = 1000): number {
    const cutoff = nowT - windowMs;
    let from = this.samples[0];
    for (const s of this.samples) {
      if (s.t > cutoff) break;
      from = s;
    }
    const to = this.samples[this.samples.length - 1];
    const dtSec = (to.t - from.t) / 1000;
    if (dtSec <= 0) return 0;
    return ((to.bytes - from.bytes) * 8) / 1e6 / dtSec;
  }

  result(warmupMs: number): ThroughputResult {
    const last = this.samples[this.samples.length - 1];

    let warmupBytes = 0;
    let warmupT = 0;
    if (last.t > warmupMs) {
      const i = this.samples.findIndex((s) => s.t >= warmupMs);
      if (i > 0) {
        const a = this.samples[i - 1];
        const b = this.samples[i];
        const frac = b.t === a.t ? 0 : (warmupMs - a.t) / (b.t - a.t);
        warmupBytes = a.bytes + (b.bytes - a.bytes) * frac;
        warmupT = warmupMs;
      }
    }

    const durationMs = last.t - warmupT;
    const bytesTransferred = last.bytes - warmupBytes;
    const mbps = durationMs > 0 ? (bytesTransferred * 8) / 1e6 / (durationMs / 1000) : 0;

    return { mbps, bytesTransferred: this.cumulativeBytes, durationMs: last.t };
  }
}

export async function measureDownload(
  dataPlane: DataPlane,
  config: DownloadMeasurementConfig = DEFAULT_DOWNLOAD_CONFIG,
  onProgress?: (progress: ThroughputProgress) => void,
  externalSignal?: AbortSignal
): Promise<ThroughputResult> {
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  const startTime = performance.now();
  const totalWindowMs = config.warmupMs + config.measureMs;
  const sampler = new ThroughputSampler(startTime);
  let bytesPerStream = config.initialBytesPerStream;

  async function runStream(): Promise<void> {
    while (performance.now() - startTime < totalWindowMs && !controller.signal.aborted) {
      const requestSize = bytesPerStream;
      const requestStart = performance.now();
      try {
        await dataPlane.download(requestSize, (delta, ts) => sampler.add(delta, ts), controller.signal);
      } catch (err) {
        if (controller.signal.aborted) return;
        throw err;
      }
      const elapsed = performance.now() - requestStart;
      // Finished faster than expected: the link can sustain a bigger request,
      // so scale up rather than pay per-request overhead on the next restart.
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
