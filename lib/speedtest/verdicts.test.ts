import { describe, expect, it } from "vitest";
import { computeVerdicts, type VerdictInput } from "./verdicts";

function baseInput(overrides: Partial<VerdictInput> = {}): VerdictInput {
  return {
    idleLatency: { latencyMs: 20, jitterMs: 5, samples: [] },
    download: { mbps: 100, bytesTransferred: 0, durationMs: 0 },
    upload: { mbps: 20, bytesTransferred: 0, durationMs: 0 },
    bufferbloatGrade: "A+",
    ...overrides,
  };
}

function verdict(result: ReturnType<typeof computeVerdicts>, id: string) {
  const v = result.find((r) => r.id === id);
  if (!v) throw new Error(`missing verdict: ${id}`);
  return v;
}

describe("computeVerdicts", () => {
  it("passes every use case on a fast, low-latency, low-bufferbloat connection", () => {
    const verdicts = computeVerdicts(baseInput());
    expect(verdicts.every((v) => v.pass)).toBe(true);
  });

  describe("4K streaming (>= 25 Mbps down)", () => {
    it("fails just under the threshold", () => {
      const v = verdict(computeVerdicts(baseInput({ download: { mbps: 24.9, bytesTransferred: 0, durationMs: 0 } })), "streaming-4k");
      expect(v.pass).toBe(false);
    });

    it("passes at the threshold", () => {
      const v = verdict(computeVerdicts(baseInput({ download: { mbps: 25, bytesTransferred: 0, durationMs: 0 } })), "streaming-4k");
      expect(v.pass).toBe(true);
    });
  });

  describe("HD video calls (>=4 Mbps both ways, jitter <30ms, bufferbloat >=B)", () => {
    it("fails when upload is too slow", () => {
      const v = verdict(computeVerdicts(baseInput({ upload: { mbps: 3.9, bytesTransferred: 0, durationMs: 0 } })), "hd-video-calls");
      expect(v.pass).toBe(false);
    });

    it("fails when jitter is too high even if bandwidth is fine", () => {
      const v = verdict(
        computeVerdicts(baseInput({ idleLatency: { latencyMs: 20, jitterMs: 30, samples: [] } })),
        "hd-video-calls"
      );
      expect(v.pass).toBe(false);
    });

    it("fails when bufferbloat grade is below B", () => {
      const v = verdict(computeVerdicts(baseInput({ bufferbloatGrade: "C" })), "hd-video-calls");
      expect(v.pass).toBe(false);
    });

    it("passes exactly at the B bufferbloat threshold", () => {
      const v = verdict(computeVerdicts(baseInput({ bufferbloatGrade: "B" })), "hd-video-calls");
      expect(v.pass).toBe(true);
    });
  });

  describe("Competitive gaming (ping <50ms, bufferbloat >=A)", () => {
    it("fails at exactly 50ms ping", () => {
      const v = verdict(
        computeVerdicts(baseInput({ idleLatency: { latencyMs: 50, jitterMs: 5, samples: [] } })),
        "competitive-gaming"
      );
      expect(v.pass).toBe(false);
    });

    it("passes just under 50ms ping with an A grade", () => {
      const v = verdict(
        computeVerdicts(baseInput({ idleLatency: { latencyMs: 49, jitterMs: 5, samples: [] }, bufferbloatGrade: "A" })),
        "competitive-gaming"
      );
      expect(v.pass).toBe(true);
    });

    it("fails a B bufferbloat grade even with great ping", () => {
      const v = verdict(computeVerdicts(baseInput({ bufferbloatGrade: "B" })), "competitive-gaming");
      expect(v.pass).toBe(false);
    });
  });

  describe("WFH / large uploads (>=10 Mbps up)", () => {
    it("fails just under the threshold", () => {
      const v = verdict(computeVerdicts(baseInput({ upload: { mbps: 9.9, bytesTransferred: 0, durationMs: 0 } })), "wfh-uploads");
      expect(v.pass).toBe(false);
    });

    it("passes at the threshold", () => {
      const v = verdict(computeVerdicts(baseInput({ upload: { mbps: 10, bytesTransferred: 0, durationMs: 0 } })), "wfh-uploads");
      expect(v.pass).toBe(true);
    });
  });
});
