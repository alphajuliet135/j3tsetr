import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { createHmac } from "crypto"
import { prisma } from "@/lib/db"

type Ctx = { params: Promise<{ shareToken: string }> }

function signToken(shareToken: string): string {
  return createHmac("sha256", process.env.NEXTAUTH_SECRET ?? "dev-secret")
    .update(shareToken)
    .digest("hex")
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { shareToken } = await params
  const { password } = await req.json()

  const journey = await prisma.journey.findFirst({
    where: { shareToken, isShared: true },
    select: { sharePassword: true },
  })

  if (!journey || !journey.sharePassword) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const valid = await compare(String(password), journey.sharePassword)
  if (!valid) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(`j3tsetr_unlock_${shareToken}`, signToken(shareToken), {
    httpOnly: true,
    sameSite: "lax",
    path: `/j/${shareToken}`,
    maxAge: 60 * 60 * 24 * 30, // 30 days
  })
  return res
}
