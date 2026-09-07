import { ipAddress } from "@vercel/functions";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashIp } from "@/lib/hash";
import { resultsRatelimit } from "@/lib/ratelimit";
import type { BufferbloatGrade } from "@/lib/speedtest/types";

const BUFFERBLOAT_GRADES: BufferbloatGrade[] = ["A+", "A", "B", "C", "D", "F"];

interface ResultSubmission {
  downloadMbps: number;
  uploadMbps: number;
  idleMs: number;
  jitterMs: number;
  loadedDownMs: number;
  loadedUpMs: number;
  bufferbloatGrade: BufferbloatGrade;
  isp: string | null;
  asn: number | null;
  colo: string | null;
  city: string | null;
  country: string | null;
}

function isFiniteNumberInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function isOptionalString(value: unknown, maxLength: number): value is string | null {
  return value === null || (typeof value === "string" && value.length > 0 && value.length <= maxLength);
}

function parseSubmission(body: unknown): ResultSubmission | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  if (!isFiniteNumberInRange(b.downloadMbps, 0, 100_000)) return null;
  if (!isFiniteNumberInRange(b.uploadMbps, 0, 100_000)) return null;
  if (!isFiniteNumberInRange(b.idleMs, 0, 60_000)) return null;
  if (!isFiniteNumberInRange(b.jitterMs, 0, 60_000)) return null;
  if (!isFiniteNumberInRange(b.loadedDownMs, 0, 60_000)) return null;
  if (!isFiniteNumberInRange(b.loadedUpMs, 0, 60_000)) return null;
  if (typeof b.bufferbloatGrade !== "string" || !BUFFERBLOAT_GRADES.includes(b.bufferbloatGrade as BufferbloatGrade)) return null;
  if (!isOptionalString(b.isp ?? null, 256)) return null;
  if (b.asn !== null && b.asn !== undefined && !isFiniteNumberInRange(b.asn, 0, 4_294_967_295)) return null;
  if (!isOptionalString(b.colo ?? null, 16)) return null;
  if (!isOptionalString(b.city ?? null, 128)) return null;
  if (!isOptionalString(b.country ?? null, 8)) return null;

  return {
    downloadMbps: b.downloadMbps,
    uploadMbps: b.uploadMbps,
    idleMs: b.idleMs,
    jitterMs: b.jitterMs,
    loadedDownMs: b.loadedDownMs,
    loadedUpMs: b.loadedUpMs,
    bufferbloatGrade: b.bufferbloatGrade as BufferbloatGrade,
    isp: (b.isp as string | null) ?? null,
    asn: (b.asn as number | null | undefined) ?? null,
    colo: (b.colo as string | null) ?? null,
    city: (b.city as string | null) ?? null,
    country: (b.country as string | null) ?? null,
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = ipAddress(request) ?? "unknown";

  const { success } = await resultsRatelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const submission = parseSubmission(body);
  if (!submission) {
    return NextResponse.json({ error: "Invalid result payload" }, { status: 400 });
  }

  const id = nanoid(10);

  await db.result.create({
    data: {
      id,
      downloadMbps: submission.downloadMbps,
      uploadMbps: submission.uploadMbps,
      idleMs: submission.idleMs,
      jitterMs: submission.jitterMs,
      loadedDownMs: submission.loadedDownMs,
      loadedUpMs: submission.loadedUpMs,
      bufferbloat: submission.bufferbloatGrade,
      isp: submission.isp,
      asn: submission.asn,
      colo: submission.colo,
      city: submission.city,
      country: submission.country,
      ipHash: hashIp(ip),
    },
  });

  return NextResponse.json({ id }, { status: 201 });
}
