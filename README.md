<div align="center">

# FollowTrain v2

**AirDrop for socials — one QR code, everyone follows everyone, no login required.**

![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/-Supabase-3ECF8E?logo=supabase&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/-Tailwind-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel-000000?logo=vercel&logoColor=white)
![License](https://img.shields.io/badge/license-AGPLv3%20%2B%20Commercial-00D4C8.svg)

</div>

---

## What it does

FollowTrain v2 solves the awkward "what's your IG?" shuffle at events. One person creates a "train" and shares the link or QR code — everyone joins, sees each other's profiles across up to 11 social platforms, and can open any handle directly. No app download, no account, no API calls to social networks. Trains auto-delete after 72 hours, keeping things lightweight and private.

## Features

- Create a train with a unique shareable URL and QR code
- Join by entering a display name and any combination of social media handles
- View all participants as profile cards — click any handle to open the profile directly
- Smart username autocomplete with avatar previews for duplicate display names
- Edit your own entry after joining
- Export participant lists with customisable platform selection (11 platforms)
- Admin controls: lock trains, kick participants, manage settings with persistent admin token
- Automatic ID collision handling — train creation never fails on duplicate IDs
- Demo train with infinite expiry for showcasing the app
- Dark mode with SSR-safe initialisation
- English and Chinese (zh) language support
- Supabase Edge Function for automatic cleanup of expired trains
- Mobile-first responsive design, no login or account required

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Tailwind CSS |
| Database & Auth | Supabase (Postgres + RLS + Edge Functions) |
| Routing | react-router-dom v7 |
| Icons | lucide-react |
| QR Code | react-qr-code |
| Hosting | Vercel |

## Screenshots

_Screenshots coming soon._ The app icon (`public/followtrain-icon.png`) exists in the repo, but no UI screenshots have been captured yet.

## Quick Start

```bash
git clone https://github.com/TheBooleanJulian/followtrain-v2
cd followtrain-v2
npm install
cp .env.example .env
# Add your Supabase URL and anon key to .env
npm start
```

The app runs on [http://localhost:3000](http://localhost:3000).

## Configuration

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_SUPABASE_URL` | Yes | Your Supabase project URL |
| `REACT_APP_SUPABASE_ANON_KEY` | Yes | Your Supabase anon/public key |

## Project Structure

```
followtrain-v2/
|-- src/
|   |-- types/
|   |   `-- supabase.ts          # Auto-generated Supabase types
|   `-- ...
|-- supabase/
|   `-- functions/
|       `-- cleanup-trains.ts    # Edge Function: delete expired trains
|-- migrations/                  # Database migration SQL files
|-- public/                      # Static assets + legal pages
|-- supabase_security.sql        # RLS policies
|-- tailwind.config.js
|-- vercel.json
`-- package.json
```

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the migration SQL from `migrations/` in the Supabase SQL Editor
3. Enable Realtime on the `participants` table
4. Deploy the cleanup Edge Function: `npm run supabase:deploy`
5. Configure scheduled cleanup — see `SUPABASE_SCHEDULING.md`

## Status / Roadmap

- [x] Core train creation and joining
- [x] Admin controls (lock, kick, token persistence)
- [x] QR code sharing
- [x] 11-platform social handle support
- [x] Dark mode + Chinese localisation
- [x] Demo train with infinite expiry
- [x] Supabase Edge Function cleanup
- [ ] Additional language support

## Changelog

- **Jul 2026** — Fixed `.gitignore` encoding (UTF-16 → UTF-8); removed `node_modules/`, `build/`, and schema SQL files from tracking
- **Apr 2026** — Added `thebooleanjulian-bot-core` dependency
- **Feb 2026 (late)** — Added demo train with infinite expiry and Supabase Edge Function for automated cleanup
- **Feb 2026** — Improved dark mode with SSR-safe initialisation and proper class handling; removed Spanish and French, added Chinese (zh) translations
- **Feb 2026** — Resolved Vercel build failures (react-scripts permissions, CI mode ESLint, source maps disabled in production)
- **Feb 2026** — Implemented comprehensive feature set: admin token persistence, smart autocomplete, enhanced export, edit-own-entry, legal pages
- **Feb 2026** — Security hardening: proper Supabase RLS policies, removed `.env` and `.env.production` from Git tracking

## License

This project is dual licensed.

- Community Edition — [GNU Affero General Public License v3 (AGPLv3)](LICENSE). Free to use, modify, and self-host. If you distribute a modified version or run it as a network service, you must make the corresponding source available.
- Commercial License — for organisations that want to embed, modify, or distribute this software without AGPLv3's obligations. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

---

<div align="center">
<sub>Built by <a href="https://github.com/TheBooleanJulian">@TheBooleanJulian</a></sub>
</div>