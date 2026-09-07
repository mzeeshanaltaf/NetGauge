import { geolocation } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";

export interface GeoResponse {
  city: string | null;
  country: string | null;
  region: string | null;
  latitude: string | null;
  longitude: string | null;
}

// Vercel's geo headers are only populated on deployed environments, never
// on `next dev` — every field is null on localhost. Callers must fall back
// gracefully rather than treating null as an error.
export async function GET(request: NextRequest): Promise<NextResponse<GeoResponse>> {
  const geo = geolocation(request);

  return NextResponse.json(
    {
      city: geo.city ?? null,
      country: geo.country ?? null,
      region: geo.countryRegion ?? null,
      latitude: geo.latitude ?? null,
      longitude: geo.longitude ?? null,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
