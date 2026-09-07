"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { WorkerOutboundMessage, WorkerStartMessage } from "@/lib/speedtest/worker";
import type { SpeedTestProgress, SpeedTestResult } from "@/lib/speedtest/types";

export type SpeedTestStatus = "idle" | "running" | "done" | "error";

export interface ThroughputPoint {
  elapsedMs: number;
  mbps: number;
}

export interface UseSpeedTestState {
  status: SpeedTestStatus;
  progress: SpeedTestProgress | null;
  result: SpeedTestResult | null;
  error: string | null;
  downloadSeries: ThroughputPoint[];
  uploadSeries: ThroughputPoint[];
  start: () => void;
}

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;

/**
 * Owns the Web Worker lifecycle for the measurement engine. Runs the full
 * sequence off the main thread so the page stays responsive mid-test.
 */
export function useSpeedTest(): UseSpeedTestState {
  const [status, setStatus] = useState<SpeedTestStatus>("idle");
  const [progress, setProgress] = useState<SpeedTestProgress | null>(null);
  const [result, setResult] = useState<SpeedTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadSeries, setDownloadSeries] = useState<ThroughputPoint[]>([]);
  const [uploadSeries, setUploadSeries] = useState<ThroughputPoint[]>([]);
  const workerRef = useRef<Worker | null>(null);
  // Wall-clock reference for the chart's x-axis. The engine's own
  // `elapsedMs` resets at the start of each phase (download, then upload),
  // which would overlap two series at x=0 — this keeps one continuous timeline.
  const testStartRef = useRef(0);

  useEffect(() => {
    return () => workerRef.current?.terminate();
  }, []);

  const start = useCallback(() => {
    if (!WORKER_URL) {
      setStatus("error");
      setError("Worker URL is not configured.");
      return;
    }

    workerRef.current?.terminate();
    setStatus("running");
    setProgress(null);
    setResult(null);
    setError(null);
    setDownloadSeries([]);
    setUploadSeries([]);
    testStartRef.current = performance.now();

    const worker = new Worker(new URL("../lib/speedtest/worker.ts", import.meta.url));
    workerRef.current = worker;

    worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const message = event.data;
      if (message.type === "progress") {
        setProgress(message.progress);
        const elapsedMs = performance.now() - testStartRef.current;
        if (message.progress.phase === "download") {
          const { mbpsNow } = message.progress;
          setDownloadSeries((series) => [...series, { elapsedMs, mbps: mbpsNow }]);
        } else if (message.progress.phase === "upload") {
          const { mbpsNow } = message.progress;
          setUploadSeries((series) => [...series, { elapsedMs, mbps: mbpsNow }]);
        }
      } else if (message.type === "result") {
        setResult(message.result);
        setStatus("done");
        worker.terminate();
        workerRef.current = null;
      } else if (message.type === "error") {
        setError(message.message);
        setStatus("error");
        worker.terminate();
        workerRef.current = null;
      }
    };

    worker.onerror = (event) => {
      setError(event.message || "The measurement worker crashed.");
      setStatus("error");
      worker.terminate();
      workerRef.current = null;
    };

    const startMessage: WorkerStartMessage = { type: "start", workerUrl: WORKER_URL };
    worker.postMessage(startMessage);
  }, []);

  return { status, progress, result, error, downloadSeries, uploadSeries, start };
}
