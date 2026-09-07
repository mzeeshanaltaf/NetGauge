"use client";

import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import { saveHistoryEntry } from "@/lib/history";
import type { GeoResponse } from "@/app/api/geo/route";
import type { WorkerMeta } from "@/hooks/use-network-meta";
import type { SpeedTestResult } from "@/lib/speedtest/types";

export interface UseResultSubmissionState {
  /** The share-page id once persistence succeeds; null while pending or on failure. */
  shareId: string | null;
  submitting: boolean;
}

/**
 * Persists a completed result to `/api/results` and records it in local
 * history. Local history is written either way — persistence is best-effort
 * (rate limits, a transient DB hiccup) and shouldn't block the trend chart.
 */
export function useResultSubmission(
  result: SpeedTestResult | null,
  meta: WorkerMeta | null,
  geo: GeoResponse | null
): UseResultSubmissionState {
  const [shareId, setShareId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittedFor = useRef<SpeedTestResult | null>(null);

  useEffect(() => {
    if (!result || submittedFor.current === result) return;
    submittedFor.current = result;
    setShareId(null);
    setSubmitting(true);

    const { idleLatency, download, upload, loadedLatencyDown, loadedLatencyUp, bufferbloat } = result;

    let cancelled = false;

    (async () => {
      let id: string | null = null;
      try {
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            downloadMbps: download.mbps,
            uploadMbps: upload.mbps,
            idleMs: idleLatency.latencyMs,
            jitterMs: idleLatency.jitterMs,
            loadedDownMs: loadedLatencyDown.latencyMs,
            loadedUpMs: loadedLatencyUp.latencyMs,
            bufferbloatGrade: bufferbloat.grade,
            isp: meta?.asOrganization ?? null,
            asn: meta?.asn ?? null,
            colo: meta?.colo ?? null,
            city: geo?.city ?? null,
            country: geo?.country ?? null,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { id: string };
          id = data.id;
        }
      } catch {
        // Offline or the API is unreachable — fall through, still record locally.
      }

      saveHistoryEntry({
        id: nanoid(12),
        createdAt: new Date().toISOString(),
        downloadMbps: download.mbps,
        uploadMbps: upload.mbps,
        idleMs: idleLatency.latencyMs,
        jitterMs: idleLatency.jitterMs,
        addedLatencyMs: bufferbloat.addedLatencyMs,
        bufferbloatGrade: bufferbloat.grade,
        shareId: id,
      });

      if (!cancelled) {
        setShareId(id);
        setSubmitting(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [result, meta, geo]);

  return { shareId, submitting };
}
