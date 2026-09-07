import type { BufferbloatGrade } from "./types";

// Waveform's added-latency scale.
const THRESHOLDS: [number, BufferbloatGrade][] = [
  [5, "A+"],
  [30, "A"],
  [60, "B"],
  [200, "C"],
  [400, "D"],
];

export function gradeBufferbloat(addedLatencyMs: number): BufferbloatGrade {
  for (const [max, grade] of THRESHOLDS) {
    if (addedLatencyMs < max) return grade;
  }
  return "F";
}

const GRADE_ORDER: BufferbloatGrade[] = ["F", "D", "C", "B", "A", "A+"];

export function gradeAtLeast(grade: BufferbloatGrade, threshold: BufferbloatGrade): boolean {
  return GRADE_ORDER.indexOf(grade) >= GRADE_ORDER.indexOf(threshold);
}
