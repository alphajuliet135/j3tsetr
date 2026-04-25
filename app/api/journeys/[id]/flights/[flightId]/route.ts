import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string; flightId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId, flightId } = await params

  const flight = await prisma.flight.findFirst({
    where: { id: flightId, journeyId, journey: { userId: session.user.id } },
  })
  if (!flight) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.flight.delete({ where: { id: flightId } })
  return NextResponse.json({ ok: true })
}
