import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId } = await params
  const journey = await prisma.journey.findFirst({
    where: { id: journeyId, userId: user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { title, location, startDate, endDate, notes } = await req.json()
  if (!title || !startDate || !endDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const stayBreak = await prisma.stayBreak.create({
    data: {
      title: title.trim(),
      location: location?.trim() || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      notes: notes?.trim() || null,
      journeyId,
    },
  })

  return NextResponse.json(stayBreak, { status: 201 })
}
