"use client";

import { useEffect, useState } from "react";
import type { GeoResponse } from "@/app/api/geo/route";
import type { WorkerMeta } from "@/hooks/use-network-meta";

interface NetworkInformation {
  effectiveType?: string;
  downlink?: number;
}

function getConnection(): NetworkInformation | null {
  const nav = navigator as Navigator & {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
  };
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection ?? null;
}

function parseUserAgent(ua: string): { browser: string; os: string } {
  let browser = "Unknown browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua)) browser = "Safari";

  let os = "Unknown OS";
  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { browser, os };
}

interface IspPanelProps {
  meta: WorkerMeta | null;
  metaFailed: boolean;
  geo: GeoResponse | null;
}

export function IspPanel({ meta, metaFailed, geo }: IspPanelProps) {
  const [client, setClient] = useState<{ browser: string; os: string; effectiveType: string | null; downlink: string | null } | null>(
    null
  );

  useEffect(() => {
    const connection = getConnection();
    const { browser, os } = parseUserAgent(navigator.userAgent);
    setClient({
      browser,
      os,
      effectiveType: connection?.effectiveType ?? null,
      downlink: connection?.downlink != null ? `${connection.downlink} Mbps` : null,
    });
  }, []);

  const hasLocation = geo && (geo.city || geo.country);

  return (
    <div className="w-full max-w-2xl divide-y divide-border rounded-lg border border-border">
      <Cluster title="Network">
        <Field label="IP address" value={meta?.ip ?? (metaFailed ? "Unavailable" : "—")} />
        <Field label="ISP" value={meta?.asOrganization ?? (metaFailed ? "Unavailable" : "—")} />
        <Field label="ASN" value={meta?.asn != null ? `AS${meta.asn}` : metaFailed ? "Unavailable" : "—"} />
        <Field label="Edge location" value={meta?.colo ?? (metaFailed ? "Unavailable" : "—")} />
      </Cluster>
      <Cluster title="Location">
        {geo === null ? (
          <>
            <Field label="City" value="—" />
            <Field label="Country" value="—" />
          </>
        ) : hasLocation ? (
          <>
            <Field label="City" value={geo.city ?? "Unknown"} />
            <Field label="Region" value={[geo.region, geo.country].filter(Boolean).join(", ") || "Unknown"} />
          </>
        ) : (
          <div className="col-span-2 text-sm text-muted-foreground">
            Not available in local development. This resolves on a deployed preview.
          </div>
        )}
      </Cluster>
      <Cluster title="Device">
        <Field label="Browser" value={client?.browser ?? "—"} />
        <Field label="OS" value={client?.os ?? "—"} />
        <Field label="Network type" value={client?.effectiveType?.toUpperCase() ?? "Unknown"} />
        <Field label="Reported downlink" value={client?.downlink ?? "Unknown"} />
      </Cluster>
    </div>
  );
}

function Cluster({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
      <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-2.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}
