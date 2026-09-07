import { describe, expect, it } from "vitest";
import { gradeAtLeast, gradeBufferbloat } from "./grade";

describe("gradeBufferbloat", () => {
  it("grades the A+/A boundary at 5ms", () => {
    expect(gradeBufferbloat(4)).toBe("A+");
    expect(gradeBufferbloat(5)).toBe("A");
  });

  it("grades the A/B boundary at 30ms", () => {
    expect(gradeBufferbloat(29)).toBe("A");
    expect(gradeBufferbloat(30)).toBe("B");
  });

  it("grades the B/C boundary at 60ms", () => {
    expect(gradeBufferbloat(59)).toBe("B");
    expect(gradeBufferbloat(60)).toBe("C");
  });

  it("grades the C/D boundary at 200ms", () => {
    expect(gradeBufferbloat(199)).toBe("C");
    expect(gradeBufferbloat(200)).toBe("D");
  });

  it("grades the D/F boundary at 400ms", () => {
    expect(gradeBufferbloat(399)).toBe("D");
    expect(gradeBufferbloat(400)).toBe("F");
  });

  it("grades zero added latency as A+", () => {
    expect(gradeBufferbloat(0)).toBe("A+");
  });

  it("grades very high added latency as F", () => {
    expect(gradeBufferbloat(10000)).toBe("F");
  });
});

describe("gradeAtLeast", () => {
  it("treats equal grades as meeting the threshold", () => {
    expect(gradeAtLeast("B", "B")).toBe(true);
  });

  it("treats a better grade as meeting a lower threshold", () => {
    expect(gradeAtLeast("A+", "B")).toBe(true);
  });

  it("treats a worse grade as failing a higher threshold", () => {
    expect(gradeAtLeast("C", "B")).toBe(false);
  });
});
