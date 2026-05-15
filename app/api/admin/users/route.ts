import { NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, username: true, createdAt: true, _count: { select: { journeys: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(users)
}
