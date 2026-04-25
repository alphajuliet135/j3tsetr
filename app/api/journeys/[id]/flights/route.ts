import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId } = await params

  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, userId: session.user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = await req.json()
  const {
    flightNumber,
    airline,
    origin,
    destination,
    originCity,
    destinationCity,
    departureTime,
    arrivalTime,
    status,
    gate,
    terminal,
    delay,
    aircraft,
    rawData,
  } = body

  if (!flightNumber || !origin || !destination || !departureTime || !arrivalTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const flight = await prisma.flight.create({
    data: {
      flightNumber,
      airline: airline ?? null,
      origin,
      destination,
      originCity: originCity ?? null,
      destinationCity: destinationCity ?? null,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      status: status ?? "scheduled",
      gate: gate ?? null,
      terminal: terminal ?? null,
      delay: delay ?? null,
      aircraft: aircraft ?? null,
      rawData: rawData ?? null,
      journeyId,
    },
  })

  return NextResponse.json(flight, { status: 201 })
}
