import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

export async function POST(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { endpoint, keys } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 })
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: { p256dh: keys.p256dh, auth: keys.auth, userId: user.id },
    create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId: user.id },
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { endpoint } = await req.json()

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: user.id },
  })

  return NextResponse.json({ ok: true })
}
