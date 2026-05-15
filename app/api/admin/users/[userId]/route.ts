import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ userId: string }> }

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const me = await requireUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await params
  if (userId === me.id) {
    return NextResponse.json({ error: "Use /api/user/me to edit your own account" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const { username, newPassword } = await req.json()
  const data: { username?: string; password?: string } = {}

  if (username !== undefined) {
    if (typeof username !== "string" || username.length < 3 || username.length > 32) {
      return NextResponse.json({ error: "Username must be 3–32 characters" }, { status: 400 })
    }
    const taken = await prisma.user.findFirst({ where: { username, NOT: { id: userId } } })
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

  await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const me = await requireUser()
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId } = await params
  if (userId === me.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
  }

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 })

  await prisma.user.delete({ where: { id: userId } })
  return NextResponse.json({ ok: true })
}
