import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  if (process.env.ALLOW_REGISTRATION === "false") {
    return NextResponse.json({ error: "Registration is disabled" }, { status: 403 })
  }

  const body = await req.json()
  const { username, password } = body

  if (!username || typeof username !== "string" || username.length < 3 || username.length > 32) {
    return NextResponse.json({ error: "Username must be 3–32 characters" }, { status: 400 })
  }

  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 })
  }

  const hashed = await hash(password, 12)
  const user = await prisma.user.create({
    data: { username, password: hashed },
    select: { id: true, username: true },
  })

  return NextResponse.json(user, { status: 201 })
}
