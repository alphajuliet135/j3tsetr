import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const journeys = await prisma.journey.findMany({
    where: { userId: user.id },
    include: { _count: { select: { flights: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(journeys)
}

export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { name, description } = body

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const journey = await prisma.journey.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      shareToken: nanoid(12),
      userId: user.id,
    },
  })

  return NextResponse.json(journey, { status: 201 })
}
