import type { BufferbloatGrade } from "@/lib/speedtest/types";

export interface HistoryEntry {
  id: string;
  createdAt: string;
  downloadMbps: number;
  uploadMbps: number;
  idleMs: number;
  jitterMs: number;
  addedLatencyMs: number;
  bufferbloatGrade: BufferbloatGrade;
  /** Present only if the result was also persisted server-side. */
  shareId: string | null;
}

const STORAGE_KEY = "netgauge:history";
const MAX_ENTRIES = 20;
const UPDATE_EVENT = "netgauge:history-updated";

/** History lives entirely client-side, independent of the `netgauge` database. */
export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const next = [entry, ...loadHistory()].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch {
    // Quota exceeded or storage disabled (e.g. private browsing) — history
    // just won't persist this run; the current result is still shown.
  }
}

/** Notifies open History views after a write, and across tabs via `storage`. */
export function subscribeToHistory(onChange: () => void): () => void {
  window.addEventListener(UPDATE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(UPDATE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function historyToJson(entries: HistoryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function historyToCsv(entries: HistoryEntry[]): string {
  const header = ["createdAt", "downloadMbps", "uploadMbps", "idleMs", "jitterMs", "addedLatencyMs", "bufferbloatGrade", "shareId"];
  const rows = entries.map((e) => [
    e.createdAt,
    e.downloadMbps,
    e.uploadMbps,
    e.idleMs,
    e.jitterMs,
    e.addedLatencyMs,
    e.bufferbloatGrade,
    e.shareId ?? "",
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}
