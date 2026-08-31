# resto-ui — RestoFood frontend

Next.js frontend for RestoFood. Two surfaces, deliberately given different
treatments because they do different jobs:

| Route | Who it's for | Job |
|---|---|---|
| `/` | the cafe owner | Upload the menu card, **verify the AI read it right**, publish |
| `/r/[slug]` | the diner at the table | Make the food look worth ordering |

It talks to the FastAPI backend in `../resto-api`.

## Run it

Two terminals — the backend must be up first, or the console shows
"backend not reachable".

```bash
# terminal 1 — backend
cd resto-api
uv run uvicorn app.main:app --reload --port 8100

# terminal 2 — frontend
cd resto-ui
npm install          # first time only
npm run dev          # → http://localhost:3000
```

`.env.local` holds the backend URL (copy from `.env.local.example`):

```
NEXT_PUBLIC_API_URL=http://localhost:8100
```

Dish images and QR codes are proxied through `/menus/*` (see `next.config.mjs`)
so every asset is same-origin.

## Design system — "Steel & Indigo"

Grounded in the subject rather than picked from a palette generator: the cool,
blue-biased neutrals come from the brushed steel of a thali and tumbler; the
indigo accent from block-print dye. Cool neutrals are a deliberate choice —
they make warm food photography advance off the page where a cream ground
would flatten it.

- **Colour** — every value is a CSS custom property defined once in
  `app/globals.css`. Components read `var(--token)` and never a literal, so
  light and dark each resolve as a complete set.
- **Type** — `Rozha One` (display, used once per page) + `Mukta` (body,
  300–700). Both carry **Devanagari as well as Latin**, because real Indian
  menus are bilingual and a face that renders tofu boxes for half the menu is
  not a candidate. Self-hosted at build time via `next/font` — no runtime CDN.
- **Signature — the leader rail.** Printed menus join a dish to its price with
  leader dots. Here the join is a hairline and prices sit in a fixed right rail
  with tabular figures, so a section's prices stack into one scannable column.
- **Themes** — light, system-dark, and an explicit `data-theme` override are
  all handled. No colour is declared only inside a media query.

Deliberately **no Tailwind**: utility defaults are what produced the templated
look this replaced.

## Layout

```
app/
  globals.css          design tokens, both themes, primitives
  layout.tsx           fonts + html shell
  page.tsx             owner console (client component)
  console.css
  r/[slug]/
    page.tsx           diner menu (server component)
    menu.css
lib/
  api.ts               typed calls to the FastAPI backend
  types.ts             mirrors app/schemas/menu.py
```

## Checks

```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

## Not built yet

Ordering and the kitchen screen. Both need backend endpoints that don't exist
yet (no `orders` table, no WebSocket) — the diner menu currently ends at
"Ready to order? Call your server."
