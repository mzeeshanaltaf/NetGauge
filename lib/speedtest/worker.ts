/**
 * Web Worker entry point. Runs the full measurement sequence off the main
 * thread — byte-counting six concurrent stream readers would blow the
 * <200ms INP budget on a page whose entire premise is measuring performance.
 *
 * Instantiate from the main thread with:
 *   new Worker(new URL("./worker.ts", import.meta.url))
 *
 * The project's tsconfig targets DOM (main-thread) lib, not WebWorker lib,
 * so the global scope is accessed through a narrow local interface instead
 * of relying on `DedicatedWorkerGlobalScope` typings.
 */
import { CloudflareDataPlane, DEFAULT_CONFIG, runSpeedTest } from "./index";
import type { SpeedTestConfig, SpeedTestProgress, SpeedTestResult } from "./types";

export interface WorkerStartMessage {
  type: "start";
  workerUrl: string;
  config?: SpeedTestConfig;
}

export type WorkerOutboundMessage =
  | { type: "progress"; progress: SpeedTestProgress }
  | { type: "result"; result: SpeedTestResult }
  | { type: "error"; message: string };

interface WorkerGlobalScope {
  onmessage: ((event: MessageEvent<WorkerStartMessage>) => void) | null;
  postMessage(message: WorkerOutboundMessage): void;
}

const scope = self as unknown as WorkerGlobalScope;

scope.onmessage = async (event) => {
  const message = event.data;
  if (message.type !== "start") return;

  try {
    const dataPlane = new CloudflareDataPlane(message.workerUrl);
    const result = await runSpeedTest(
      dataPlane,
      (progress) => scope.postMessage({ type: "progress", progress }),
      message.config ?? DEFAULT_CONFIG
    );
    scope.postMessage({ type: "result", result });
  } catch (err) {
    scope.postMessage({ type: "error", message: err instanceof Error ? err.message : String(err) });
  }
};

export {};
