"use client";

import { useEffect, useState } from "react";

export interface WorkerMeta {
  ip: string | null;
  asn: number | null;
  asOrganization: string | null;
  colo: string | null;
  httpProtocol: string | null;
  // Only present once the Worker version that returns location is deployed.
  city?: string | null;
  country?: string | null;
  region?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface GeoResponse {
  city: string | null;
  country: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
}

const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL;

const EMPTY_GEO: GeoResponse = { city: null, country: null, region: null, latitude: null, longitude: null };

function geoFromMeta(meta: WorkerMeta): GeoResponse {
  return {
    city: meta.city ?? null,
    country: meta.country ?? null,
    region: meta.region ?? null,
    latitude: meta.latitude ?? null,
    longitude: meta.longitude ?? null,
  };
}

/**
 * Fetches ISP/ASN and coarse city/country from the Worker's /meta once per
 * page load (Cloudflare's request.cf, at the edge nearest the user). Shared
 * by the ISP panel (display) and the result-submission hook (persistence),
 * so the two never double-fetch.
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
          if (cancelled) return;
          setMeta(data);
          setGeo(geoFromMeta(data));
        })
        .catch(() => {
          if (cancelled) return;
          setMetaFailed(true);
          setGeo(EMPTY_GEO);
        });
    } else {
      setMetaFailed(true);
      setGeo(EMPTY_GEO);
    }

    return () => {
      cancelled = true;
    };
  }, []);

  return { meta, metaFailed, geo };
}
