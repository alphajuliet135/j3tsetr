import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"
import { searchFlights } from "@/lib/aviationstack"

type Ctx = { params: Promise<{ id: string; flightId: string }> }

const TERMINAL = new Set(["landed", "cancelled", "diverted"])

export async function POST(_req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId, flightId } = await params
  const flight = await prisma.flight.findFirst({
    where: { id: flightId, journeyId, journey: { userId: user.id } },
  })
  if (!flight) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (TERMINAL.has(flight.status)) return NextResponse.json(flight)

  const date = flight.departureTime.toISOString().slice(0, 10)
  let results
  try {
    results = await searchFlights(flight.flightNumber, date)
  } catch {
    return NextResponse.json(flight)
  }

  if (!results.length) return NextResponse.json(flight)

  const latest = results[0]
  const updated = await prisma.flight.update({
    where: { id: flightId },
    data: {
      status: latest.flight_status,
      gate: latest.departure.gate,
      terminal: latest.departure.terminal,
      delay: latest.departure.delay,
      aircraft: latest.aircraft?.iata ?? null,
      rawData: JSON.stringify(latest),
      lastUpdated: new Date(),
    },
  })

  return NextResponse.json(updated)
}
