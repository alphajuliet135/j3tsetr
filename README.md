# j3tsetr

A self-hosted, Docker-first flight tracking PWA. Track flights grouped into journeys, share live status with friends and family, and get push notifications — all from your own server.

## Features

- **Journeys** — group flights and stays into named trips (e.g. "Paris Trip 2026")
- **Live flight status** — auto-refreshes every 3 minutes via [AeroDataBox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox); status is also derived from flight times client-side
- **Stays / breaks** — add hotel or layover entries between flights
- **Layover detection** — automatically shown between connecting flights (≤12 h, same airport)
- **Public share links** — share a journey with anyone, no login required; optional password protection
- **Auto-delete** — journeys can self-delete once all flights have landed
- **Mobile-first PWA** — installable on iOS and Android, works offline
- **Web Push notifications**
- **Multi-user** with username/password auth
- **SQLite** — no external database needed

## Quick Start

```bash
cp .env.example .env
# Fill in your values (see Environment Variables below)
docker compose up
```

The app will be available at [http://localhost:3000](http://localhost:3000).

To create your first account, set `ALLOW_REGISTRATION=true` in `.env`, restart, sign up, then set it back to `false`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite path. Use `file:/data/j3tsetr.db` in Docker |
| `NEXTAUTH_SECRET` | Yes | Random secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Full public URL of your instance |
| `AERODATABOX_API_KEY` | Yes | RapidAPI key — [subscribe free](https://rapidapi.com/aedbx-aedbx/api/aerodatabox) |
| `VAPID_PUBLIC_KEY` | Yes | Generate with `npx web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | Yes | Same as above |
| `VAPID_EMAIL` | Yes | Contact email for VAPID |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | No | Mapbox public token — enables in-flight map view |
| `ALLOW_REGISTRATION` | No | Set to `"true"` to allow new sign-ups (default: `"false"`) |

## Docker (pre-built image)

```bash
docker pull ghcr.io/YOUR_GITHUB_USERNAME/j3tsetr:latest
```

Or use the provided `docker-compose.yml` which builds from source.

## Self-Hosting

### Reverse proxy (nginx example)

```nginx
server {
    listen 80;
    server_name flights.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Set `NEXTAUTH_URL=https://flights.yourdomain.com` and restart.

## Development

```bash
cp .env.example .env
# Set ALLOW_REGISTRATION=true and fill in other values
npm install
npm run db:migrate   # create SQLite DB and apply migrations
npm run dev          # http://localhost:3000 (Turbopack)
```

### Database commands

```bash
npm run db:migrate   # create a new migration (dev)
npm run db:deploy    # apply migrations (production)
npm run db:studio    # open Prisma Studio
```

### Releases

Tag a commit to trigger an automatic Docker build and publish to `ghcr.io`:

```bash
gh release create v0.3.0 --target main --title "v0.3.0" --notes "..."
```

This builds and pushes a Docker image tagged as both `v0.3.0` and `latest`.

## Tech Stack

- [Next.js 15](https://nextjs.org) — App Router, Turbopack dev server
- [Prisma](https://prisma.io) + SQLite
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [AeroDataBox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox) — flight data
- [web-push](https://github.com/web-push-libs/web-push) — notifications
- [Mapbox / react-map-gl](https://visgl.github.io/react-map-gl/) — in-flight map (optional)

## License

MIT
