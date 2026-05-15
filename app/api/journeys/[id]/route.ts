import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const journey = await prisma.journey.findFirst({
    where: { id, userId: user.id },
    include: { flights: { orderBy: { departureTime: "asc" } } },
  })

  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(journey)
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { name, description, isShared, autoDelete } = body

  const journey = await prisma.journey.findFirst({
    where: { id, userId: user.id },
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
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const journey = await prisma.journey.findFirst({
    where: { id, userId: user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.journey.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
