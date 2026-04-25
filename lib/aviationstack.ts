const BASE_URL = "https://aerodatabox.p.rapidapi.com"

// Internal AeroDataBox response shape
interface AeroDataBoxFlight {
  number: string
  status: string
  departure: {
    airport: { iata: string; name: string }
    scheduledTime?: { utc: string }
    revisedTime?: { utc: string }
    terminal?: string
    gate?: string
  }
  arrival: {
    airport: { iata: string; name: string }
    scheduledTime?: { utc: string }
    revisedTime?: { utc: string }
    terminal?: string
  }
  airline?: { name: string; iata: string }
  aircraft?: { model: string; reg: string }
}

// Public interface kept for route.ts compatibility
export interface AviationFlight {
  flight_date: string
  flight_status: string
  departure: {
    airport: string
    iata: string
    scheduled: string
    estimated: string
    actual: string | null
    delay: number | null
    terminal: string | null
    gate: string | null
  }
  arrival: {
    airport: string
    iata: string
    scheduled: string
    estimated: string
    actual: string | null
    delay: number | null
    terminal: string | null
    gate: string | null
  }
  airline: { name: string; iata: string }
  flight: { iata: string; number: string }
  aircraft: { iata: string; registration: string } | null
}

function mapStatus(status: string): string {
  switch (status.toLowerCase()) {
    case "arrived": return "landed"
    case "departed":
    case "enroute": return "active"
    case "cancelled": return "cancelled"
    default: return "scheduled"
  }
}

function toAviationFlight(raw: AeroDataBoxFlight): AviationFlight {
  const depScheduled = raw.departure.scheduledTime?.utc ?? ""
  const depRevised = raw.departure.revisedTime?.utc ?? depScheduled
  const arrScheduled = raw.arrival.scheduledTime?.utc ?? ""
  const arrRevised = raw.arrival.revisedTime?.utc ?? arrScheduled

  const depDelayMs = depScheduled && depRevised
    ? new Date(depRevised).getTime() - new Date(depScheduled).getTime()
    : 0
  const depDelayMin = depDelayMs > 0 ? Math.round(depDelayMs / 60000) : null

  return {
    flight_date: depScheduled ? depScheduled.slice(0, 10) : "",
    flight_status: mapStatus(raw.status),
    departure: {
      airport: raw.departure.airport.name,
      iata: raw.departure.airport.iata,
      scheduled: depScheduled,
      estimated: depRevised,
      actual: raw.status === "Departed" || raw.status === "Arrived" ? depRevised : null,
      delay: depDelayMin,
      terminal: raw.departure.terminal ?? null,
      gate: raw.departure.gate ?? null,
    },
    arrival: {
      airport: raw.arrival.airport.name,
      iata: raw.arrival.airport.iata,
      scheduled: arrScheduled,
      estimated: arrRevised,
      actual: raw.status === "Arrived" ? arrRevised : null,
      delay: null,
      terminal: raw.arrival.terminal ?? null,
      gate: null,
    },
    airline: raw.airline ?? { name: "", iata: "" },
    flight: { iata: raw.number.replace(" ", ""), number: raw.number },
    aircraft: raw.aircraft ? { iata: raw.aircraft.model, registration: raw.aircraft.reg } : null,
  }
}

export async function searchFlights(
  flightIata: string,
  date?: string
): Promise<AviationFlight[]> {
  const key = process.env.AERODATABOX_API_KEY
  if (!key) throw new Error("AERODATABOX_API_KEY not set")

  const segment = date ? `${flightIata}/${date}` : flightIata
  const res = await fetch(`${BASE_URL}/flights/number/${segment}`, {
    headers: {
      "X-RapidAPI-Key": key,
      "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com",
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) throw new Error(`AeroDataBox error: ${res.status}`)

  const json: AeroDataBoxFlight[] = await res.json()
  return (json ?? []).map(toAviationFlight)
}

export function mapToFlightData(raw: AviationFlight) {
  return {
    flightNumber: raw.flight.iata,
    airline: raw.airline.name,
    origin: raw.departure.iata,
    destination: raw.arrival.iata,
    originCity: raw.departure.airport,
    destinationCity: raw.arrival.airport,
    departureTime: new Date(raw.departure.scheduled),
    arrivalTime: new Date(raw.arrival.scheduled),
    status: raw.flight_status,
    gate: raw.departure.gate,
    terminal: raw.departure.terminal,
    delay: raw.departure.delay,
    aircraft: raw.aircraft?.iata ?? null,
    rawData: JSON.stringify(raw),
  }
}
