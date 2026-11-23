/**
 * The caller's IP as seen by the reverse proxy in front of the app.
 *
 * Production runs behind Coolify's Traefik, which sets `X-Real-Ip` to the TCP
 * peer address and, because no upstream is configured as trusted, rewrites
 * `X-Forwarded-For` rather than appending to a client-supplied value. So both
 * headers carry the real client IP and neither can be spoofed by the caller.
 */
export function clientIp(headers: Headers): string | null {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first;
  }
  return null;
}
