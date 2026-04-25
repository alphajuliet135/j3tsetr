import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { nanoid } from "nanoid"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const journeys = await prisma.journey.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { flights: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json(journeys)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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
      userId: session.user.id,
    },
  })

  return NextResponse.json(journey, { status: 201 })
}
