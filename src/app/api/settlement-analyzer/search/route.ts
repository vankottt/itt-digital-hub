import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3) return NextResponse.json([]);

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    countrycodes: "bg",
    addressdetails: "1",
    polygon_geojson: "1",
    limit: request.nextUrl.searchParams.get("limit") ?? "7",
    dedupe: "1",
    "accept-language": request.nextUrl.searchParams.get("lang") === "en" ? "en" : "bg",
  });

  const response = await fetch(`${NOMINATIM}?${params}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": request.nextUrl.searchParams.get("lang") === "en" ? "en-GB,en;q=0.9,bg;q=0.4" : "bg-BG,bg;q=0.9,en;q=0.4",
      "User-Agent": "ITT Digital Hub Settlement Analyzer (https://ittdigitalhub.org; office@ittdigitalhub.org)",
    },
    next: { revalidate: 0 },
  });

  if (response.status === 429) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if (!response.ok) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
  return NextResponse.json(await response.json());
}
