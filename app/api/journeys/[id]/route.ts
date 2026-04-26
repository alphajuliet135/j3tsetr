import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const journey = await prisma.journey.findFirst({
    where: { id, userId: session.user.id },
    include: { flights: { orderBy: { departureTime: "asc" } } },
  })

  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(journey)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, isShared, autoDelete } = body

  const journey = await prisma.journey.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updated = await prisma.journey.update({
    where: { id },
    data: {
      ...(typeof name === "string" ? { name: name.trim() } : {}),
      ...(description !== undefined ? { description: description?.trim() || null } : {}),
      ...(typeof isShared === "boolean" ? { isShared } : {}),
      ...(typeof autoDelete === "boolean" ? { autoDelete } : {}),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const journey = await prisma.journey.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.journey.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
