# Glitch UI — Milestone 1

A lightweight, modular Vite + React + TypeScript frontend for Glitch. The design uses a pitch-black canvas, restrained neon-lime accents, shadcn/ui-compatible configuration, Lucide icons, and GSAP micro-animations.

## Included
- Futuristic local-first login screen
- Device monitoring dashboard UI
- Responsive sidebar and metric cards
- CPU, memory, disk, uptime and host panels
- Monitor page refreshes from `GET /api/metrics` when the local backend is connected
- Demo mode when backend metrics are unavailable
- Modular components and hooks
- GSAP animations that respect `prefers-reduced-motion`

## Run
Requires Node.js 20+ recommended.

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

Production build:
```bash
npm run build
```

## Authentication note
The login form is a **frontend prototype only**. It does not authenticate users or store passwords. The demo button enters the dashboard locally. Before real use, implement backend authentication, hashed passwords, secure sessions, CSRF protections as appropriate, and rate limiting. Do not treat the demo screen as a security boundary.

## Device monitoring integration
The frontend polls `http://127.0.0.1:4780/api/metrics` when served locally. If unavailable, it shows clearly labeled demo metrics. Browser JavaScript cannot directly inspect the host's CPU/RAM/disk, so real metrics must come from the local Glitch backend/agent.

Expected response:
```json
{
  "hostname": "workstation",
  "platform": "Linux x86_64",
  "uptime_seconds": 86400,
  "cpu_percent": 17.4,
  "memory": { "used_percent": 48.2, "used_bytes": 8120000000, "total_bytes": 16800000000 },
  "disk": { "used_percent": 62.1, "used_bytes": 250000000000, "total_bytes": 400000000000 },
  "load_average": [0.4, 0.5, 0.6],
  "updated_at": "2026-10-29T10:00:00Z"
}
```

## Add real shadcn/ui components
The repository includes `components.json` and Tailwind setup in the shadcn-compatible shape. To add official components later, configure the `@` path alias in Vite and TypeScript, then use the shadcn CLI to add components. The current UI uses lightweight local primitives so the initial install stays small.
