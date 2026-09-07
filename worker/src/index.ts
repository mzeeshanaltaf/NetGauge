/**
 * netgauge data plane. Serves test bytes from Cloudflare's edge so measurement
 * traffic never touches Vercel or the VPS. See docs/phase-2-worker.md.
 */

interface Env {
  RATE_LIMITER: RateLimit;
}

// crypto.getRandomValues caps at 65536 bytes per call. Random generation is
// disallowed in the Workers global scope, so this is lazily generated on the
// first request and reused (per-isolate) for every /download after that.
const CHUNK_SIZE = 65536;
let cachedChunk: Uint8Array | null = null;
function getChunk(): Uint8Array {
  if (!cachedChunk) {
    cachedChunk = new Uint8Array(CHUNK_SIZE);
    crypto.getRandomValues(cachedChunk);
  }
  return cachedChunk;
}

// 500 MB ceiling — big enough for a saturating download test on a gigabit
// line, small enough to keep a single request from running away.
const MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024;

// /embed is served from the same origin as the main site (it's an iframe
// pointed at netgauge.zeeshanai.cloud/embed, not a separate deployment), so
// its fetches carry this same Origin — no extra entry needed for it.
const STATIC_ALLOWED_ORIGINS = new Set([
  "https://netgauge.zeeshanai.cloud",
  "http://localhost:3000",
]);

function isAllowedOrigin(origin: string): boolean {
  if (STATIC_ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function baseHeaders(origin: string | null): Headers {
  const headers = new Headers();
  // Without this, cross-origin PerformanceResourceTiming reads back zeroed
  // timings and every measurement silently reports 0.
  headers.set("Timing-Allow-Origin", "*");
  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  return headers;
}

function handleOptions(request: Request): Response {
  const origin = request.headers.get("Origin");
  const headers = baseHeaders(origin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    request.headers.get("Access-Control-Request-Headers") ?? "Content-Type"
  );
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

function handlePing(request: Request): Response {
  return new Response(null, { status: 204, headers: baseHeaders(request.headers.get("Origin")) });
}

function tooManyRequests(origin: string | null): Response {
  const headers = baseHeaders(origin);
  headers.set("Content-Type", "application/json");
  headers.set("Retry-After", "60");
  return new Response(JSON.stringify({ error: "rate limit exceeded" }), { status: 429, headers });
}

async function handleDownload(request: Request, url: URL, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.RATE_LIMITER.limit({ key: ip });
  if (!success) return tooManyRequests(origin);

  const bytesParam = url.searchParams.get("bytes");
  const bytes = bytesParam ? Number(bytesParam) : NaN;

  if (!Number.isInteger(bytes) || bytes < 0 || bytes > MAX_DOWNLOAD_BYTES) {
    const headers = baseHeaders(origin);
    headers.set("Content-Type", "application/json");
    return new Response(JSON.stringify({ error: `bytes must be an integer between 0 and ${MAX_DOWNLOAD_BYTES}` }), {
      status: 400,
      headers,
    });
  }

  const chunk = getChunk();
  let remaining = bytes;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (remaining <= 0) {
        controller.close();
        return;
      }
      const n = Math.min(CHUNK_SIZE, remaining);
      controller.enqueue(n === CHUNK_SIZE ? chunk : chunk.subarray(0, n));
      remaining -= n;
    },
  });

  const headers = baseHeaders(origin);
  headers.set("Content-Type", "application/octet-stream");
  headers.set("Content-Length", String(bytes));
  // A repeated chunk compresses to almost nothing under gzip/br, which would
  // report absurd, fake speeds — force the response to stay uncompressed.
  headers.set("Content-Encoding", "identity");
  headers.set("Cache-Control", "no-store, no-transform");

  return new Response(stream, { status: 200, headers });
}

async function handleUpload(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin");

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  const { success } = await env.RATE_LIMITER.limit({ key: ip });
  if (!success) return tooManyRequests(origin);

  if (request.body) {
    // Drain without buffering — the client's byte count comes from
    // xhr.upload.onprogress, not from anything the Worker returns.
    await request.body.pipeTo(new WritableStream());
  }
  const headers = baseHeaders(origin);
  headers.set("Cache-Control", "no-store");
  return new Response(null, { status: 204, headers });
}

function handleMeta(request: Request): Response {
  const origin = request.headers.get("Origin");
  const cf = request.cf as IncomingRequestCfProperties | undefined;

  const body = {
    ip: request.headers.get("cf-connecting-ip"),
    asn: cf?.asn ?? null,
    asOrganization: cf?.asOrganization ?? null,
    colo: cf?.colo ?? null,
    httpProtocol: cf?.httpProtocol ?? null,
  };

  const headers = baseHeaders(origin);
  headers.set("Content-Type", "application/json");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(body), { status: 200, headers });
}

export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }

    const url = new URL(request.url);

    if (url.pathname === "/ping" && request.method === "GET") {
      return handlePing(request);
    }

    if (url.pathname === "/download" && request.method === "GET") {
      return handleDownload(request, url, env);
    }

    if (url.pathname === "/upload" && request.method === "POST") {
      return handleUpload(request, env);
    }

    if (url.pathname === "/meta" && request.method === "GET") {
      return handleMeta(request);
    }

    const headers = baseHeaders(request.headers.get("Origin"));
    return new Response("Not found", { status: 404, headers });
  },
} satisfies ExportedHandler<Env>;
