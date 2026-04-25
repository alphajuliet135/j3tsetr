import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { searchFlights, mapToFlightData } from "@/lib/aviationstack"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const flightNumber = searchParams.get("flightNumber")
  const date = searchParams.get("date") ?? undefined

  if (!flightNumber) {
    return NextResponse.json({ error: "flightNumber is required" }, { status: 400 })
  }

  try {
    const raw = await searchFlights(flightNumber, date)
    const flights = raw.map(mapToFlightData)
    return NextResponse.json(flights)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Search failed"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
