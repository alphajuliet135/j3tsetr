"use client"

import { useEffect, useState } from "react"
import Map, { Source, Layer, Marker } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

type Coords = { lat: number; lng: number }

// ── Spherical math ─────────────────────────────────────────────────────────────

const toRad = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

function slerp([lat1, lng1]: [number, number], [lat2, lng2]: [number, number], t: number): [number, number] {
  const φ1 = toRad(lat1), λ1 = toRad(lng1)
  const φ2 = toRad(lat2), λ2 = toRad(lng2)
  const d = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2
  ))
  if (d === 0) return [lat1, lng1]
  const A = Math.sin((1 - t) * d) / Math.sin(d)
  const B = Math.sin(t * d) / Math.sin(d)
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
  const z = A * Math.sin(φ1) + B * Math.sin(φ2)
  return [toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]
}

function bearing([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const φ1 = toRad(lat1), φ2 = toRad(lat2), dλ = toRad(lng2 - lng1)
  const y = Math.sin(dλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

function makeArc(from: [number, number], to: [number, number], steps = 80): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const [lat, lng] = slerp(from, to, i / steps)
    return [lng, lat] as [number, number]
  })
}

function calcProgress(departure: Date | string, arrival: Date | string): number {
  const dep = new Date(departure).getTime()
  const arr = new Date(arrival).getTime()
  const now = Date.now()
  if (now <= dep) return 0
  if (now >= arr) return 1
  return (now - dep) / (arr - dep)
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function FlightMap({
  originIata,
  destIata,
  departure,
  arrival,
}: {
  originIata: string
  destIata: string
  departure: Date | string
  arrival: Date | string
}) {
  const [coords, setCoords] = useState<{ origin: Coords; dest: Coords } | null>(null)
  const [progress, setProgress] = useState(() => calcProgress(departure, arrival))

  useEffect(() => {
    fetch(`/api/airports?codes=${originIata},${destIata}`)
      .then((r) => r.json())
      .then((data: Record<string, Coords | null>) => {
        const origin = data[originIata.toUpperCase()]
        const dest = data[destIata.toUpperCase()]
        if (origin && dest) setCoords({ origin, dest })
      })
      .catch(() => {})
  }, [originIata, destIata])

  useEffect(() => {
    const id = setInterval(() => setProgress(calcProgress(departure, arrival)), 30_000)
    return () => clearInterval(id)
  }, [departure, arrival])

  if (!coords || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return null

  const from: [number, number] = [coords.origin.lat, coords.origin.lng]
  const to: [number, number] = [coords.dest.lat, coords.dest.lng]

  const arc = makeArc(from, to)
  const [planeLat, planeLng] = slerp(from, to, progress)
  const [aheadLat, aheadLng] = slerp(from, to, Math.min(progress + 0.02, 1))
  const planeBearing = bearing([planeLat, planeLng], [aheadLat, aheadLng])

  const pad = 8
  const bounds: [[number, number], [number, number]] = [
    [Math.min(coords.origin.lng, coords.dest.lng) - pad, Math.min(coords.origin.lat, coords.dest.lat) - pad],
    [Math.max(coords.origin.lng, coords.dest.lng) + pad, Math.max(coords.origin.lat, coords.dest.lat) + pad],
  ]

  const arcGeoJson = {
    type: "Feature" as const,
    geometry: { type: "LineString" as const, coordinates: arc },
    properties: {},
  }

  return (
    <div className="mt-3 pt-3 border-t border-[#2C2C2E]">
      <div className="rounded-xl overflow-hidden" style={{ height: 200 }}>
        <Map
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          initialViewState={{ bounds, fitBoundsOptions: { padding: 40 } }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          interactive={false}
          attributionControl={false}
        >
          {/* Completed path */}
          <Source type="geojson" data={{ ...arcGeoJson, geometry: { ...arcGeoJson.geometry, coordinates: arc.slice(0, Math.round(progress * arc.length)) } }}>
            <Layer type="line" paint={{ "line-color": "#3b82f6", "line-width": 2, "line-opacity": 0.9 }} />
          </Source>

          {/* Remaining path */}
          <Source type="geojson" data={{ ...arcGeoJson, geometry: { ...arcGeoJson.geometry, coordinates: arc.slice(Math.round(progress * arc.length)) } }}>
            <Layer type="line" paint={{ "line-color": "#3b82f6", "line-width": 1.5, "line-opacity": 0.3, "line-dasharray": [3, 3] }} />
          </Source>

          {/* Origin dot */}
          <Marker latitude={coords.origin.lat} longitude={coords.origin.lng} anchor="center">
            <div className="w-2 h-2 rounded-full bg-gray-400 ring-1 ring-gray-600" />
          </Marker>

          {/* Destination dot */}
          <Marker latitude={coords.dest.lat} longitude={coords.dest.lng} anchor="center">
            <div className="w-2 h-2 rounded-full bg-gray-400 ring-1 ring-gray-600" />
          </Marker>

          {/* Plane */}
          <Marker latitude={planeLat} longitude={planeLng} anchor="center">
            <div style={{ transform: `rotate(${planeBearing}deg)` }}>
              <svg className="w-5 h-5 text-blue-400 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
              </svg>
            </div>
          </Marker>
        </Map>
      </div>
    </div>
  )
}
