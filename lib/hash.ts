import { createHash } from "crypto";

/**
 * One-way hash for the requester's IP. The raw IP is never persisted —
 * only this digest, salted so it can't be rainbow-tabled back.
 */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not configured");
  return createHash("sha256").update(ip + salt).digest("hex");
}
