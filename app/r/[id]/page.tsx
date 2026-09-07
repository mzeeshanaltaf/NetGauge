import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ResultCard } from "@/components/result-card";
import { computeVerdicts } from "@/lib/speedtest/verdicts";
import type { BufferbloatGrade, LatencySample, SpeedTestResult, ThroughputResult } from "@/lib/speedtest/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getResult(id: string) {
  return db.result.findUnique({ where: { id } });
}

function toSpeedTestResult(row: NonNullable<Awaited<ReturnType<typeof getResult>>>): SpeedTestResult {
  const downloadMbps = row.downloadMbps.toNumber();
  const uploadMbps = row.uploadMbps.toNumber();
  const idleMs = row.idleMs.toNumber();
  const jitterMs = row.jitterMs.toNumber();
  const loadedDownMs = row.loadedDownMs.toNumber();
  const loadedUpMs = row.loadedUpMs.toNumber();
  const grade = row.bufferbloat as BufferbloatGrade;

  const idleLatency: LatencySample = { latencyMs: idleMs, jitterMs, samples: [] };
  const loadedLatencyDown: LatencySample = { latencyMs: loadedDownMs, jitterMs: 0, samples: [] };
  const loadedLatencyUp: LatencySample = { latencyMs: loadedUpMs, jitterMs: 0, samples: [] };
  const download: ThroughputResult = { mbps: downloadMbps, bytesTransferred: 0, durationMs: 0 };
  const upload: ThroughputResult = { mbps: uploadMbps, bytesTransferred: 0, durationMs: 0 };
  const addedLatencyMs = Math.max(loadedDownMs, loadedUpMs) - idleMs;

  return {
    idleLatency,
    download,
    loadedLatencyDown,
    upload,
    loadedLatencyUp,
    bufferbloat: { addedLatencyMs, grade },
    verdicts: computeVerdicts({ idleLatency, download, upload, bufferbloatGrade: grade }),
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const row = await getResult(id);
  if (!row) return { title: "Result not found — netgauge" };

  const downloadMbps = row.downloadMbps.toNumber();
  const uploadMbps = row.uploadMbps.toNumber();
  const title = `${downloadMbps.toFixed(0)} Mbps down / ${uploadMbps.toFixed(0)} Mbps up — netgauge speed test`;
  const description = `Bufferbloat grade ${row.bufferbloat}. Idle latency ${row.idleMs.toNumber().toFixed(0)} ms. Measured with netgauge — test your own connection's speed, latency, and bufferbloat.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/r/${id}` },
    robots: { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/r/${id}`,
      type: "website",
    },
  };
}

export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  const row = await getResult(id);
  if (!row) notFound();

  const result = toSpeedTestResult(row);
  const location = [row.city, row.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-16 pb-24">
      <div className="flex max-w-xl flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">A shared netgauge result</h1>
        <p className="text-sm text-muted-foreground">
          {row.createdAt.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
          {location ? ` · ${location}` : ""}
          {row.isp ? ` · ${row.isp}` : ""}
        </p>
      </div>

      <div className="mt-10 w-full">
        <ResultCard result={result} />
      </div>

      <div className="mt-10 flex flex-col items-center gap-2">
        <p className="text-sm text-muted-foreground">How does your own connection compare?</p>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          Test your connection →
        </Link>
      </div>
    </div>
  );
}
