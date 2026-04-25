import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import FlightCard from "@/components/FlightCard"

type Props = { params: Promise<{ shareToken: string }> }

export async function generateMetadata({ params }: Props) {
  const { shareToken } = await params
  const journey = await prisma.journey.findFirst({
    where: { shareToken, isShared: true },
    select: { name: true },
  })
  return { title: journey ? `${journey.name} — j3tsetr` : "Not found" }
}

export default async function PublicSharePage({ params }: Props) {
  const { shareToken } = await params

  const journey = await prisma.journey.findFirst({
    where: { shareToken, isShared: true },
    include: {
      flights: { orderBy: { departureTime: "asc" } },
      user: { select: { username: true } },
    },
  })

  if (!journey) notFound()

  return (
    <div className="min-h-screen bg-[#111111] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">✈️</span>
            <span className="text-gray-500 text-sm">j3tsetr</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{journey.name}</h1>
          {journey.description && (
            <p className="text-gray-500 text-sm mt-1">{journey.description}</p>
          )}
          <p className="text-gray-600 text-xs mt-2">Shared by {journey.user.username}</p>
        </div>

        {journey.flights.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No flights in this journey yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {journey.flights.map((flight) => (
              <FlightCard key={flight.id} flight={flight} />
            ))}
          </div>
        )}

        <p className="text-center text-gray-700 text-xs mt-10">
          Powered by{" "}
          <a href="https://github.com/yourusername/j3tsetr" className="hover:text-gray-500 transition">
            j3tsetr
          </a>
        </p>
      </div>
    </div>
  )
}
