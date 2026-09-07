import { describe, expect, it } from "vitest";
import { meanAbsoluteConsecutiveDiff, median } from "./latency";

describe("median", () => {
  it("returns 0 for an empty list", () => {
    expect(median([])).toBe(0);
  });

  it("returns the single value for a single-sample list", () => {
    expect(median([42])).toBe(42);
  });

  it("averages the two middle values for an even-length list", () => {
    expect(median([10, 20, 30, 40])).toBe(25);
  });

  it("picks the middle value for an odd-length list", () => {
    expect(median([30, 10, 20])).toBe(20);
  });

  it("ignores outliers the way a mean would not", () => {
    expect(median([10, 11, 12, 500])).toBe(11.5);
  });
});

describe("meanAbsoluteConsecutiveDiff (jitter)", () => {
  it("returns 0 for fewer than two samples", () => {
    expect(meanAbsoluteConsecutiveDiff([])).toBe(0);
    expect(meanAbsoluteConsecutiveDiff([10])).toBe(0);
  });

  it("returns 0 for perfectly stable RTTs", () => {
    expect(meanAbsoluteConsecutiveDiff([20, 20, 20, 20])).toBe(0);
  });

  it("averages the absolute differences between consecutive samples", () => {
    // diffs: |15-10|=5, |10-15|=5, |20-10|=10 -> mean 20/3
    expect(meanAbsoluteConsecutiveDiff([10, 15, 10, 20])).toBeCloseTo(20 / 3);
  });

  it("is unaffected by the direction of change", () => {
    expect(meanAbsoluteConsecutiveDiff([10, 30])).toBe(20);
    expect(meanAbsoluteConsecutiveDiff([30, 10])).toBe(20);
  });
});
