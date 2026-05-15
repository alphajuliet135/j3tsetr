import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./db"

export async function requireUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  })
}
