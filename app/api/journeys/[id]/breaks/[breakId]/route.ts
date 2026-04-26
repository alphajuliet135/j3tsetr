import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string; breakId: string }> }

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id: journeyId, breakId } = await params
  const stayBreak = await prisma.stayBreak.findFirst({
    where: { id: breakId, journeyId, journey: { userId: session.user.id } },
  })
  if (!stayBreak) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await prisma.stayBreak.delete({ where: { id: breakId } })
  return NextResponse.json({ ok: true })
}
