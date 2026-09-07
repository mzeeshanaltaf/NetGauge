"use client";

import { useEffect, useState } from "react";
import type { GeoResponse } from "@/app/api/geo/route";

export interface WorkerMeta {
  ip: string | null;
  asn: number | null;
  asOrganization: string | null;
  colo: string | null;
  httpProtocol: string | null;
}

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;

/**
 * Fetches ISP/ASN (from the Worker) and city/country (from Vercel geo
 * headers) once per page load. Shared by the ISP panel (display) and the
 * result-submission hook (persistence), so the two never double-fetch.
 */
export function useNetworkMeta(): { meta: WorkerMeta | null; metaFailed: boolean; geo: GeoResponse | null } {
  const [meta, setMeta] = useState<WorkerMeta | null>(null);
  const [metaFailed, setMetaFailed] = useState(false);
  const [geo, setGeo] = useState<GeoResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (WORKER_URL) {
      fetch(`${WORKER_URL}/meta`, { cache: "no-store" })
        .then((res) => (res.ok ? (res.json() as Promise<WorkerMeta>) : Promise.reject(new Error(String(res.status)))))
        .then((data) => {
          if (!cancelled) setMeta(data);
        })
        .catch(() => {
          if (!cancelled) setMetaFailed(true);
        });
    } else {
      setMetaFailed(true);
    }

    fetch("/api/geo", { cache: "no-store" })
      .then((res) => res.json() as Promise<GeoResponse>)
      .then((data) => {
        if (!cancelled) setGeo(data);
      })
      .catch(() => {
        if (!cancelled) setGeo({ city: null, country: null, region: null, latitude: null, longitude: null });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { meta, metaFailed, geo };
}
