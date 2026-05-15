import { NextRequest, NextResponse } from "next/server"
import airportData from "airports"

type AirportEntry = { iata: string; lat: string | number; lon: string | number }

const lookup = new Map<string, { lat: number; lng: number }>(
  (airportData as AirportEntry[])
    .filter((a) => a.iata)
    .map((a) => [a.iata, { lat: parseFloat(String(a.lat)), lng: parseFloat(String(a.lon)) }])
)

export async function GET(req: NextRequest) {
  const codes = req.nextUrl.searchParams.get("codes")?.split(",").map((c) => c.trim().toUpperCase()) ?? []
  const result: Record<string, { lat: number; lng: number } | null> = {}
  for (const code of codes) {
    result[code] = lookup.get(code) ?? null
  }
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=86400" },
  })
}
