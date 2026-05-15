"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import MapGL, { Source, Layer, Marker } from "react-map-gl/mapbox"
import type { MapRef } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Flight } from "@prisma/client"

type Coords = { lat: number; lng: number }

// ── Math helpers ───────────────────────────────────────────────────────────────

const toRad = (d: number) => (d * Math.PI) / 180
const toDeg = (r: number) => (r * 180) / Math.PI

function slerp([lat1, lng1]: [number, number], [lat2, lng2]: [number, number], t: number): [number, number] {
  const φ1 = toRad(lat1), λ1 = toRad(lng1), φ2 = toRad(lat2), λ2 = toRad(lng2)
  const d = 2 * Math.asin(Math.sqrt(Math.sin((φ2 - φ1) / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2))
  if (d === 0) return [lat1, lng1]
  const A = Math.sin((1 - t) * d) / Math.sin(d), B = Math.sin(t * d) / Math.sin(d)
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2)
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2)
  const z = A * Math.sin(φ1) + B * Math.sin(φ2)
  return [toDeg(Math.atan2(z, Math.sqrt(x * x + y * y))), toDeg(Math.atan2(y, x))]
}

function calcBearing([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]): number {
  const φ1 = toRad(lat1), φ2 = toRad(lat2), dλ = toRad(lng2 - lng1)
  return (toDeg(Math.atan2(Math.sin(dλ) * Math.cos(φ2), Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(dλ))) + 360) % 360
}

function makeArc(from: [number, number], to: [number, number], steps = 64): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const [lat, lng] = slerp(from, to, i / steps)
    return [lng, lat] as [number, number]
  })
}

function calcProgress(dep: Date | string, arr: Date | string): number {
  const d = new Date(dep).getTime(), a = new Date(arr).getTime(), n = Date.now()
  if (n <= d) return 0
  if (n >= a) return 1
  return (n - d) / (a - d)
}

function deriveStatus(status: string, dep: Date | string, arr: Date | string): string {
  const TERMINAL = new Set(["landed", "cancelled", "diverted"])
  if (TERMINAL.has(status) || status === "cancelled") return status
  const now = Date.now()
  if (now >= new Date(arr).getTime()) return "landed"
  if (now >= new Date(dep).getTime()) return "active"
  return status
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function JourneyMap({ flights }: { flights: Flight[] }) {
  const [coordsMap, setCoordsMap] = useState<Record<string, Coords | null>>({})
  const [loaded, setLoaded] = useState(false)
  const [, setTick] = useState(0)
  const mapRef = useRef<MapRef>(null)

  const iatas = [...new Set(flights.flatMap((f) => [f.origin, f.destination]))]

  useEffect(() => {
    if (!iatas.length) return
    fetch(`/api/airports?codes=${iatas.join(",")}`)
      .then((r) => r.json())
      .then(setCoordsMap)
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iatas.join(",")])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  if (!token) return null

  const resolved = flights
    .map((f) => ({
      flight: f,
      origin: coordsMap[f.origin],
      dest: coordsMap[f.destination],
      status: deriveStatus(f.status, f.departureTime, f.arrivalTime),
    }))
    .filter((f) => f.origin && f.dest)

  const allCoords = resolved.flatMap((f) => [f.origin!, f.dest!])
  const lngs = allCoords.map((c) => c.lng)
  const lats = allCoords.map((c) => c.lat)
  const bounds: [[number, number], [number, number]] = allCoords.length
    ? [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]]
    : [[-180, -85], [180, 85]]

  const handleLoad = useCallback(() => {
    setLoaded(true)
    mapRef.current?.fitBounds(bounds, { padding: 60, duration: 0 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(bounds)])

  // Re-fit when coords arrive after map has already loaded
  useEffect(() => {
    if (loaded && resolved.length) {
      mapRef.current?.fitBounds(bounds, { padding: 60, duration: 500 })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, JSON.stringify(bounds)])

  // Show skeleton while coords are loading
  if (!Object.keys(coordsMap).length) {
    return <div className="h-52 rounded-2xl bg-[#1C1C1E] animate-pulse mb-5" />
  }

  if (!resolved.length) return null

  return (
    <div className="mb-5 rounded-2xl overflow-hidden border border-[#2C2C2E]" style={{ height: 220 }}>
      <MapGL
        ref={mapRef}
        mapboxAccessToken={token}
        onLoad={handleLoad}
        initialViewState={{ longitude: 10, latitude: 30, zoom: 1 }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactive={false}
        attributionControl={false}
      >
        {resolved.map(({ flight, origin, dest, status }) => {
          const from: [number, number] = [origin!.lat, origin!.lng]
          const to: [number, number] = [dest!.lat, dest!.lng]
          const arc = makeArc(from, to)
          const isActive = status === "active"
          const isLanded = status === "landed"

          const actualDep = flight.delay
            ? new Date(new Date(flight.departureTime).getTime() + flight.delay * 60_000)
            : flight.departureTime
          const actualArr = flight.delay
            ? new Date(new Date(flight.arrivalTime).getTime() + flight.delay * 60_000)
            : flight.arrivalTime
          const progress = isActive ? calcProgress(actualDep, actualArr) : isLanded ? 1 : 0
          const splitIdx = Math.round(progress * arc.length)

          const [planeLat, planeLng] = slerp(from, to, progress)
          const [aheadLat, aheadLng] = slerp(from, to, Math.min(progress + 0.02, 1))
          const planeBearing = calcBearing([planeLat, planeLng], [aheadLat, aheadLng])

          return (
            <React.Fragment key={flight.id}>
              {/* Flown / full arc */}
              <Source
                id={`arc-flown-${flight.id}`}
                type="geojson"
                data={{ type: "Feature", geometry: { type: "LineString", coordinates: isActive ? arc.slice(0, Math.max(splitIdx, 1)) : arc }, properties: {} }}
              >
                <Layer
                  id={`line-flown-${flight.id}`}
                  type="line"
                  paint={{
                    "line-color": isActive ? "#3b82f6" : isLanded ? "#6b7280" : "#4b5563",
                    "line-width": isActive ? 2 : 1.5,
                    "line-opacity": isActive ? 0.9 : 0.45,
                  }}
                />
              </Source>

              {/* Remaining dashed arc for active flights */}
              {isActive && (
                <Source
                  id={`arc-remain-${flight.id}`}
                  type="geojson"
                  data={{ type: "Feature", geometry: { type: "LineString", coordinates: arc.slice(splitIdx) }, properties: {} }}
                >
                  <Layer
                    id={`line-remain-${flight.id}`}
                    type="line"
                    paint={{ "line-color": "#3b82f6", "line-width": 1.5, "line-opacity": 0.3, "line-dasharray": [3, 3] }}
                  />
                </Source>
              )}

              {/* Plane marker for active flights */}
              {isActive && (
                <Marker latitude={planeLat} longitude={planeLng} anchor="center">
                  <div style={{ transform: `rotate(${planeBearing}deg)` }}>
                    <svg className="w-4 h-4 text-blue-400 drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" />
                    </svg>
                  </div>
                </Marker>
              )}
            </React.Fragment>
          )
        })}

        {/* Airport dots — one per unique IATA */}
        {[...new Map(resolved.flatMap((f) => [[f.flight.origin, f.origin!], [f.flight.destination, f.dest!]] as [string, Coords][])).entries()].map(([iata, c]) => (
          <Marker key={`apt-${iata}`} latitude={c.lat} longitude={c.lng} anchor="center">
            <div className="w-2 h-2 rounded-full bg-gray-400 ring-1 ring-gray-600" />
          </Marker>
        ))}
      </MapGL>
    </div>
  )
}
