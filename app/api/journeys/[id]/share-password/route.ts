import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Ctx) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const journey = await prisma.journey.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!journey) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { password } = await req.json()

  if (password === null || password === "") {
    await prisma.journey.update({ where: { id }, data: { sharePassword: null } })
    return NextResponse.json({ ok: true, protected: false })
  }

  if (typeof password !== "string" || password.length < 4) {
    return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 })
  }

  const hashed = await hash(password, 10)
  await prisma.journey.update({ where: { id }, data: { sharePassword: hashed } })
  return NextResponse.json({ ok: true, protected: true })
}
