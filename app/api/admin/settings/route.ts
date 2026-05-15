import { NextRequest, NextResponse } from "next/server"
import { requireUser } from "@/lib/session"
import { prisma } from "@/lib/db"

const KEY = "allowRegistration"

async function getSetting(): Promise<boolean> {
  const row = await prisma.appSetting.findUnique({ where: { key: KEY } })
  if (row) return row.value === "true"
  return process.env.ALLOW_REGISTRATION !== "false"
}

export async function GET() {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  return NextResponse.json({ allowRegistration: await getSetting() })
}

export async function PATCH(req: NextRequest) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { allowRegistration } = await req.json()
  if (typeof allowRegistration !== "boolean") {
    return NextResponse.json({ error: "Invalid value" }, { status: 400 })
  }

  await prisma.appSetting.upsert({
    where: { key: KEY },
    update: { value: String(allowRegistration) },
    create: { key: KEY, value: String(allowRegistration) },
  })

  return NextResponse.json({ ok: true })
}
