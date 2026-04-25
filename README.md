# j3tsetr

A self-hosted, Docker-first flight tracking PWA. Track flights grouped into journeys, share live status with friends and family, and get push notifications — all from your own server.

## Features

- **Journeys** — group flights into named trips (e.g. "Paris Trip 2026")
- **Live flight status** via [AeroDataBox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox)
- **Public share links** — share a journey with anyone, no login required
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

To create your first account, temporarily set `ALLOW_REGISTRATION=true` in `.env`, restart, sign up, then set it back to `false`.

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
npm run db:push      # create SQLite DB from schema
npm run dev          # http://localhost:3000
```

### Database commands

```bash
npm run db:migrate   # create a new migration (dev)
npm run db:deploy    # apply migrations (production)
npm run db:studio    # open Prisma Studio
```

### Releases

Releases are published automatically via GitHub Actions when a tag is pushed:

```bash
git tag v1.0.0
git push origin v1.0.0
```

This builds and pushes a Docker image to `ghcr.io` tagged as both `v1.0.0` and `latest`.

## Tech Stack

- [Next.js 15](https://nextjs.org) — App Router
- [Prisma](https://prisma.io) + SQLite
- [NextAuth.js](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [AeroDataBox](https://rapidapi.com/aedbx-aedbx/api/aerodatabox) — flight data
- [web-push](https://github.com/web-push-libs/web-push) — notifications

## License

MIT
