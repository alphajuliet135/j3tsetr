import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string; flightId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId, flightId } = await params

  const flight = await prisma.flight.findFirst({
    where: { id: flightId, journeyId, journey: { userId: user.id } },
  })
  if (!flight) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.flight.delete({ where: { id: flightId } })
  return NextResponse.json({ ok: true })
}
