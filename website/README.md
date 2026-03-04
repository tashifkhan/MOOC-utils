# MOOC Utils Website

Landing site and dashboard for Notice Reminders and Assignment Solver.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- TanStack Query
- shadcn/ui (base-ui)

## Features

- Multi-page marketing site
- Notice Reminders dashboard
- Email OTP login/signup (httpOnly cookie auth)
- Public course search and browsing

## Setup

```bash
cd website
bun install
```

## Environment Variables

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## Build

```bash
bun run build
```

## Lint

```bash
bun run lint
```

## Notes

- The backend must be running for login and dashboard data.
- Do not use `npm run dev` or `bun dev` per repo guidelines.
