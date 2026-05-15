import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import JourneyCard from "@/components/JourneyCard"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function JourneysPage() {
  const session = await getServerSession(authOptions)

  const journeys = await prisma.journey.findMany({
    where: { userId: session!.user.id },
    include: { _count: { select: { flights: true } } },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-white">Journeys</h1>
        <Link
          href="/journeys/new"
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-full px-4 py-2 active:bg-blue-700 transition"
        >
          <span className="text-base leading-none">+</span>
          New
        </Link>
      </div>

      {journeys.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">✈️</span>
          <p className="text-gray-300 font-medium mb-1">No journeys yet</p>
          <p className="text-gray-600 text-sm">Create one to start tracking flights</p>
        </div>
      ) : (
        <div className="space-y-4">
          {journeys.map((journey) => (
            <JourneyCard key={journey.id} journey={journey} />
          ))}
        </div>
      )}
    </div>
  )
}
