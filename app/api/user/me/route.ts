import { NextRequest, NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username, currentPassword, newPassword } = await req.json()

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  if (!dbUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!currentPassword) {
    return NextResponse.json({ error: "Current password is required" }, { status: 400 })
  }

  const valid = await compare(currentPassword, dbUser.password)
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 })

  const data: { username?: string; password?: string } = {}

  if (username !== undefined) {
    if (typeof username !== "string" || username.length < 3 || username.length > 32) {
      return NextResponse.json({ error: "Username must be 3–32 characters" }, { status: 400 })
    }
    const taken = await prisma.user.findFirst({ where: { username, NOT: { id: user.id } } })
    if (taken) return NextResponse.json({ error: "Username already taken" }, { status: 409 })
    data.username = username
  }

  if (newPassword !== undefined) {
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }
    data.password = await hash(newPassword, 12)
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 })
  }

  await prisma.user.update({ where: { id: user.id }, data })
  return NextResponse.json({ ok: true })
}
