# Project: j3tsetr

## Overview

A self-hosted, Docker-first flight tracking PWA similar to Flighty.
Designed for easy self-hosting by anyone.

## Stack

- **Framework:** Next.js (App Router)
- **Database:** SQLite via Prisma
- **Styling:** Tailwind CSS
- **Flight Data API:** AviationStack (extendable to others later)
- **Auth:** NextAuth.js (multi-user, credentials-based)
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
- /lib → AviationStack client, push helpers, DB
- /prisma → Schema & migrations
- /public → PWA icons, manifest

## Environment Variables (via .env)

- AVIATIONSTACK_API_KEY
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY

## Docker

- Dockerfile + docker-compose.yml required
- SQLite file persisted via Docker volume
- Single-command startup: `docker compose up`

## Commands

- `npm run dev` → start dev server
- `npm run db:migrate` → run Prisma migrations
- `npm run db:studio` → open Prisma Studio

## Core Features

### Journeys

- A Journey is a named collection of flights (e.g. "Paris Trip 2026")
- Created by logged-in users
- Each Journey gets a unique public share token (e.g. `/j/abc123xyz`)
- The public share page shows live flight status for all flights in the journey
- No login required to view a shared journey page
- Owner can toggle sharing on/off

### Data Model

- User → many Journeys
- Journey → many Flights
- Journey has a `shareToken` (nanoid, unique, indexed)

### Public Share Page (`/j/[shareToken]`)

- Shows all flights in the journey with live status
- Read-only, no auth required
- Optimized for mobile (friends/family checking your status)

## UI / UX

- Mobile-first design, optimized for 375px+ screens
- Bottom navigation bar (thumb-friendly)
- Large tap targets (min 44px)
- Swipe gestures where appropriate (e.g. dismiss, reveal actions)
- Minimal chrome — content-focused
- Dark mode support
- Flight cards with clear status colors (on-time, delayed, cancelled)
- PWA — installable, feels native on iOS & Android
- No horizontal scrolling
- Skeleton loaders instead of spinners

## Out of Scope (for now)

- Email notifications
- Calendar sync
- Multiple flight data providers
