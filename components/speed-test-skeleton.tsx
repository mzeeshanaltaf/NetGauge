// Mirrors the DOM shape of the loaded widget (same box model, gap-8 rhythm,
// h-36 chart, two-gauge row) so the ssr:false swap from skeleton to the real
// widget causes no layout shift.
export function SpeedTestSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-col items-center gap-8" aria-hidden="true">
      <div className="flex w-full items-start justify-center gap-6 sm:gap-10">
        <GaugeSkeleton />
        <GaugeSkeleton />
      </div>
      <div className="h-11 w-32 rounded-lg bg-muted" />
      <div className="h-36 w-full max-w-2xl rounded-lg bg-muted" />
      <div className="w-full max-w-2xl divide-y divide-border rounded-lg border border-border">
        <SkeletonCluster rows={4} />
        <SkeletonCluster rows={2} />
        <SkeletonCluster rows={4} />
      </div>
    </div>
  );
}

function GaugeSkeleton() {
  return (
    <div className="flex w-full max-w-42.5 flex-col items-center gap-2 sm:max-w-55">
      <div className="aspect-240/140 w-full rounded-t-full border-14 border-b-0 border-muted" />
      <div className="h-2.5 w-14 rounded bg-muted" />
    </div>
  );
}

function SkeletonCluster({ rows }: { rows: number }) {
  return (
    <div className="px-5 py-4">
      <div className="h-3 w-16 rounded bg-muted" />
      <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="h-2.5 w-14 rounded bg-muted" />
            <div className="h-3.5 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
