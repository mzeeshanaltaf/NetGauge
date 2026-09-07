import { gradeAtLeast } from "./grade";
import type { BufferbloatGrade, LatencySample, ThroughputResult, UseCaseVerdict } from "./types";

export interface VerdictInput {
  idleLatency: LatencySample;
  download: ThroughputResult;
  upload: ThroughputResult;
  bufferbloatGrade: BufferbloatGrade;
}

export function computeVerdicts(input: VerdictInput): UseCaseVerdict[] {
  const { idleLatency, download, upload, bufferbloatGrade } = input;

  return [
    { id: "streaming-4k", label: "4K streaming", pass: download.mbps >= 25 },
    {
      id: "hd-video-calls",
      label: "HD video calls",
      pass: download.mbps >= 4 && upload.mbps >= 4 && idleLatency.jitterMs < 30 && gradeAtLeast(bufferbloatGrade, "B"),
    },
    {
      id: "competitive-gaming",
      label: "Competitive gaming",
      pass: idleLatency.latencyMs < 50 && gradeAtLeast(bufferbloatGrade, "A"),
    },
    { id: "wfh-uploads", label: "WFH / large uploads", pass: upload.mbps >= 10 },
  ];
}
