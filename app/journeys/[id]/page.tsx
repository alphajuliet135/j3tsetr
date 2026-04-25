import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import FlightCard from "@/components/FlightCard"
import JourneyActions from "./JourneyActions"
import AddFlightForm from "./AddFlightForm"

export const dynamic = "force-dynamic"

type Props = { params: Promise<{ id: string }> }

export default async function JourneyDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  const journey = await prisma.journey.findFirst({
    where: { id, userId: session!.user.id },
    include: {
      flights: { orderBy: { departureTime: "asc" } },
    },
  })

  if (!journey) notFound()

  const shareUrl = `${process.env.NEXTAUTH_URL ?? ""}/j/${journey.shareToken}`

  return (
    <div className="px-4 pt-6 pb-20">
      <JourneyActions journey={journey} shareUrl={shareUrl} />

      {journey.flights.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">No flights yet. Search and add one below.</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {journey.flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} journeyId={journey.id} />
          ))}
        </div>
      )}

      <AddFlightForm journeyId={journey.id} />
    </div>
  )
}
