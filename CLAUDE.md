# Project: j3tsetr

## Overview

A self-hosted, Docker-first flight tracking PWA similar to Flighty.
Designed for easy self-hosting by anyone.

## Stack

- **Framework:** Next.js 15 (App Router, Turbopack dev server)
- **Database:** SQLite via Prisma
- **Styling:** Tailwind CSS
- **Flight Data API:** AeroDataBox via RapidAPI
- **Auth:** NextAuth.js (multi-user, credentials-based, JWT sessions)
- **Notifications:** Web Push API (PWA)
- **Deployment:** Docker + docker-compose

## Key Principles

- Self-hostable by anyone (Docker-first)
- Mobile-first, PWA with offline support
- Clean, minimal UI inspired by Flighty
- Extendable flight data sources

## Project Structure

- /app → Next.js App Router pages & API routes
- /components → UI components
- /lib → AeroDataBox client (`aviationstack.ts`), push helpers, DB, session helper
- /prisma → Schema & migrations
- /public → PWA icons, manifest

## Environment Variables (via .env)

- `AERODATABOX_API_KEY` — RapidAPI key for AeroDataBox
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `NEXT_PUBLIC_MAPBOX_TOKEN` — optional, enables in-flight map
- `ALLOW_REGISTRATION` — set `"true"` to allow new sign-ups

## Docker

- Dockerfile + docker-compose.yml required
- SQLite file persisted via Docker volume
- Single-command startup: `docker compose up`

## Commands

- `npm run dev` → start dev server (Turbopack)
- `npm run db:migrate` → run Prisma migrations
- `npm run db:studio` → open Prisma Studio

## Core Features

### Journeys

- A Journey is a named collection of flights and stays (e.g. "Paris Trip 2026")
- Created by logged-in users; owner can edit name/description via modal
- Each Journey gets a unique public share token (e.g. `/j/abc123xyz`)
- The public share page shows live flight status for all flights in the journey
- No login required to view a shared journey page
- Owner can toggle sharing on/off, set a share password, enable auto-delete

### Stays / Breaks

- `StayBreak` records can be interleaved with flights in a journey timeline
- Fields: title, location, startDate, endDate, notes

### Flight Status Auto-Refresh

- On the journey detail page, each non-terminal FlightCard polls `POST /api/journeys/:id/flights/:flightId/refresh` immediately on mount and then every 3 minutes
- The endpoint re-queries AeroDataBox and updates `status`, `gate`, `terminal`, `delay`, `aircraft`, `rawData`, `lastUpdated` in the DB
- Terminal flights (landed/cancelled/diverted) are skipped — no wasted API calls
- Client-side `deriveStatus()` in FlightCard also infers status from flight times (arrival time passed → landed) for immediate visual correctness

### Layover Detection

- Consecutive flights sharing the same connecting airport with ≤12 h between arrival and next departure show a layover badge in the timeline

### Date Grouping

- Timeline items are grouped by date with a date header above the first item of each day

### Auth Helper

- `lib/session.ts` exports `requireUser()` — verifies session AND confirms user exists in DB; all authenticated API routes use this instead of raw `getServerSession` to prevent FK errors from stale JWT tokens after DB resets

### Data Model

- **User** → many Journeys, many PushSubscriptions
- **Journey** → many Flights, many StayBreaks
  - `shareToken` (nanoid, unique, indexed)
  - `isShared` (bool)
  - `sharePassword` (bcrypt hash, optional)
  - `autoDelete` (bool — deletes journey when all flights reach terminal status)
- **Flight**: flightNumber, airline, origin, destination, originCity, destinationCity, departureTime, arrivalTime, status, gate, terminal, delay, aircraft, rawData, lastUpdated
- **StayBreak**: title, location, startDate, endDate, notes

### Public Share Page (`/j/[shareToken]`)

- Shows all flights and stays with live status
- Read-only, no auth required; optional password gate
- Same layover badges and date grouping as the owner view
- Optimized for mobile (friends/family checking your status)

## UI / UX

- Mobile-first design, optimized for 375px+ screens
- Bottom navigation bar (thumb-friendly) — Journeys (suitcase icon), Search, Settings
- Large tap targets (min 44px)
- Minimal chrome — content-focused
- Dark mode (fixed dark theme, `#111111` background)
- Flight cards with status colours: scheduled (grey), active/in-flight (blue), landed (green), delayed (amber), cancelled (red)
- Inline flight progress bar between origin/destination when in-flight; departure countdown when scheduled; landing status text when landed
- PWA — installable, feels native on iOS & Android
- No horizontal scrolling
- `suppressHydrationWarning` on `<html>` and `<body>` to suppress browser-extension attribute injection

## Out of Scope (for now)

- Email notifications
- Calendar sync
- Multiple flight data providers
