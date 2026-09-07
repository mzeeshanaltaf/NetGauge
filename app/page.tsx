export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">netgauge</h1>
      <p className="max-w-md text-muted-foreground">
        Internet speed test with bufferbloat detection. Coming soon.
      </p>
    </div>
  );
}
