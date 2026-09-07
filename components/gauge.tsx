const RADIUS = 100;
const CIRCUMFERENCE = Math.PI * RADIUS;
const ARC_PATH = "M 20 130 A 100 100 0 0 1 220 130";

interface GaugeProps {
  /** Raw value driving the arc fill (not display text). */
  value: number;
  max: number;
  /** Pre-formatted number for the center readout, e.g. "412.6" or "23". */
  displayValue: string;
  unit: string;
  label: string;
  /** A CSS color, e.g. "var(--primary)". */
  color: string;
}

// Square-root scale: a gigabit line still reads as "mostly full" instead of
// making every home connection (100-500 Mbps) look empty against a linear 1000 cap.
function arcFraction(value: number, max: number): number {
  const clamped = Math.min(Math.max(value, 0), max);
  if (max <= 0) return 0;
  return Math.sqrt(clamped) / Math.sqrt(max);
}

export function Gauge({ value, max, displayValue, unit, label, color }: GaugeProps) {
  const offset = CIRCUMFERENCE * (1 - arcFraction(value, max));

  return (
    <div className="flex w-full max-w-42.5 flex-col items-center gap-2 sm:max-w-55">
      {/* No fixed height here on purpose: this box is sized entirely by the
          SVG's own intrinsic aspect ratio, so the absolutely-positioned
          readout below always shares the arc's actual coordinate space
          instead of a taller, mismatched container. */}
      <div className="relative w-full">
        <svg viewBox="0 0 240 140" className="block w-full" aria-hidden="true">
          <path d={ARC_PATH} fill="none" stroke="var(--border)" strokeWidth={14} strokeLinecap="round" />
          <path
            d={ARC_PATH}
            fill="none"
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="gauge-arc"
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
          <span className="font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
            {displayValue}
          </span>
          <span className="text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">{label}</span>
    </div>
  );
}
