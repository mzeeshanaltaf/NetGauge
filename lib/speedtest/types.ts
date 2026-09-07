/**
 * Framework-agnostic types for the measurement engine. No React imports —
 * this module is shared by the main-thread orchestrator, the Web Worker,
 * and (later) the embed widget.
 */

/** Low-level network primitives, kept behind an interface so the endpoint is swappable. */
export interface DataPlane {
  /** Round-trip time in ms for one idle/loaded probe. */
  ping(signal?: AbortSignal): Promise<number>;
  /**
   * Streams `bytes` from the data plane, calling `onChunk` with the byte
   * delta (not cumulative) and a timestamp for every chunk received.
   */
  download(bytes: number, onChunk: (deltaBytes: number, timestampMs: number) => void, signal: AbortSignal): Promise<void>;
  /**
   * Uploads `blob`, calling `onChunk` with the byte delta (not cumulative)
   * and a timestamp as the upload progresses.
   */
  upload(blob: Blob, onChunk: (deltaBytes: number, timestampMs: number) => void, signal: AbortSignal): Promise<void>;
}

export interface LatencySample {
  /** Median RTT in ms — outliers are common, so median beats mean. */
  latencyMs: number;
  /** Mean absolute difference between consecutive RTTs, in ms. */
  jitterMs: number;
  samples: number[];
}

export interface ThroughputResult {
  mbps: number;
  /** Total bytes transferred across the whole measurement window, including warm-up. */
  bytesTransferred: number;
  /** Total wall-clock duration of the measurement window, in ms. */
  durationMs: number;
}

export type BufferbloatGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface BufferbloatResult {
  /** max(loadedDown, loadedUp) - idle, in ms. */
  addedLatencyMs: number;
  grade: BufferbloatGrade;
}

export interface UseCaseVerdict {
  id: string;
  label: string;
  pass: boolean;
}

export interface SpeedTestResult {
  idleLatency: LatencySample;
  download: ThroughputResult;
  loadedLatencyDown: LatencySample;
  upload: ThroughputResult;
  loadedLatencyUp: LatencySample;
  bufferbloat: BufferbloatResult;
  verdicts: UseCaseVerdict[];
}

export interface ThroughputProgress {
  elapsedMs: number;
  mbpsNow: number;
  bytesTransferred: number;
}

export type SpeedTestProgress =
  | { phase: "idle-latency"; sampleIndex: number; sampleCount: number; latestRttMs: number }
  | ({ phase: "download" } & ThroughputProgress)
  | { phase: "loaded-latency-down"; latestRttMs: number }
  | ({ phase: "upload" } & ThroughputProgress)
  | { phase: "loaded-latency-up"; latestRttMs: number }
  | { phase: "done"; result: SpeedTestResult };

export interface DownloadMeasurementConfig {
  parallelStreams: number;
  /** TCP slow-start window discarded from the measurement, in ms. */
  warmupMs: number;
  /** Measurement window after warm-up, in ms. */
  measureMs: number;
  initialBytesPerStream: number;
  maxBytesPerStream: number;
  /** A stream that finishes faster than this doubles its next request size. */
  requestTargetMs: number;
}

export type UploadMeasurementConfig = DownloadMeasurementConfig;

export interface SpeedTestConfig {
  idleLatencySamples: number;
  loadedLatencyIntervalMs: number;
  download: DownloadMeasurementConfig;
  upload: UploadMeasurementConfig;
}
