# netgauge

Internet speed test measuring download, upload, latency, jitter, loaded latency and bufferbloat, with per-use-case verdicts. Live at `netgauge.zeeshanai.cloud`.

See [CLAUDE.md](CLAUDE.md) for architecture and non-obvious rules, and [STATUS.md](STATUS.md) for build progress.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npx prisma migrate dev
```

to apply database migrations to the `netgauge` schema.
