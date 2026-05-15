import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string; breakId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId, breakId } = await params
  const stayBreak = await prisma.stayBreak.findFirst({
    where: { id: breakId, journeyId, journey: { userId: user.id } },
  })
  if (!stayBreak) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.stayBreak.delete({ where: { id: breakId } })
  return NextResponse.json({ ok: true })
}
