# Running the web app locally

You need the API running first — the console can't sign in without it.

```bash
npm install
cp .env.local.example .env.local     # PowerShell: Copy-Item .env.local.example .env.local
npm run dev                          # → http://localhost:5005
```

Port 5005 rather than Next's default 3000, which tends to be occupied. The API
allows both from a browser, so either works if you change it.

`.env.local` needs three values:

```ini
NEXT_PUBLIC_API_URL=http://localhost:8222
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Everything here is public by design — the anon key is meant to reach the
browser. The service key never appears in this repository.

Add `NEXT_PUBLIC_MENU_DOMAIN` in production only; it tells the middleware which
host suffix marks a restaurant subdomain.

**Testing subdomains locally** needs no DNS setup: `spice-garden.localhost:5005`
resolves on its own, and the middleware treats it exactly as it will treat a
real subdomain.

```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

> Don't run `npm run build` while `npm run dev` is live — they share `.next`,
> and the dev server will start returning empty 500s until it's restarted.

## Layout

```
app/
  page.tsx            the landing page
  home.css
  dashboard/          the owner's console — upload, review, publish, edit
  admin/              back office: who to chase, recording payments
  r/[slug]/           the diner's menu
  globals.css         design tokens, both themes, shared primitives
  layout.tsx          fonts, and the script that prevents a theme flash
components/
  MenuEditor          the dish table, shared by first review and later edits
  EditRestaurant      name, address, WhatsApp, logo, and the menu
  DishPhotoCell       replace one dish's photograph
  TrialNotice         what an owner sees as their trial runs out
  LogoUpload · SignIn · ThemeToggle · Reveal
lib/
  api.ts              every call to the API, typed
  types.ts            mirrors the API's schema
  supabase.ts         browser auth client
middleware.ts         subdomain → restaurant
```

Auth is Supabase. The browser holds the session; every request to the API
carries its token, and the API verifies it against Supabase's public keys.

## Routes

| Route | Who | What they're doing |
|---|---|---|
| `/` | someone deciding | Reading the pitch |
| `/dashboard` | the restaurant owner | Uploading a menu card, checking prices, publishing |
| `/admin` | you | Seeing whose trial is ending, recording payments |
| `/r/[slug]` | a diner at the table | Browsing the menu they just scanned |

Each restaurant also answers on its own subdomain — `spicegarden.restofood.in`
— which is the same `/r/[slug]` page reached through a rewrite in
[`middleware.ts`](../middleware.ts). Both forms keep working forever, so a QR
code printed before a domain change never goes dead.

`/dashboard` and `/admin` are exempted from that rewrite, so they stay
reachable from any host.

## The design system

**Colour — paper and saffron.** The warm off-white of a printed menu card
gives the neutrals; saffron, the colour of the food and of the country, gives
the accent. Warm throughout, because the product is about appetite and cool
greys make food photography look refrigerated. Dark is a *warm* dark — a
brown-biased near-black rather than the usual blue-black — so a diner switching
themes at the table sees the same restaurant, not a different app.

The accent sits at `#b8500b` because that is where it clears 4.5:1 against the
paper ground, and the accent carries body-sized link text, not just headings.
On dark it lightens to `#f0a35a`; the darker value would vanish.

**One palette, three surfaces.** The landing page, the console and the diner's
menu all read the same tokens. Every value is a custom property defined once in
`globals.css` and repeated only in the two theme overrides; components read
`var(--token)` and never a literal. That is what makes retheming the entire
product an edit to three blocks.

Three deliberate exceptions, each commented where it appears: the paper card
and phone mock in the hero (they *depict* physical objects — paper is white and
a phone screen is dark under either theme), and the QR code's white quiet zone,
which would not scan on a dark surface.

**Type — Rozha One and Mukta.** One characterful display face, used once per
page, and one workhorse. Both were chosen under a constraint that rules out
most handsome faces: **they carry Devanagari as well as Latin.** Real Indian
menus are bilingual, and a face that renders tofu boxes for half the menu is
not a candidate. Self-hosted at build time — no runtime font CDN.

**The jali.** Behind the landing hero is a lattice of interlocking circles —
the pierced stone screen of Mughal architecture, whose purpose is to let warm
light through a wall. One inline SVG pattern, a few hundred bytes, no request.
It replaced a set of blurred gradient blobs, which are the default decoration
of every AI-era landing page and say nothing about an Indian restaurant.

**Themes.** Light, system-dark, and an explicit choice are all handled, and a
script in `layout.tsx` applies the stored preference before first paint —
without it, a diner who chose dark gets a white flash on every load, worst
exactly where it is most visible.

**No Tailwind**, deliberately: utility defaults are what produced the templated
first draft this replaced.

## Deploying

Vercel builds this from GitHub on every push to `main`. Set the same
environment variables in project settings, pointing at the deployed API.

`NEXT_PUBLIC_*` values are compiled in at build time — changing one in the
dashboard does nothing until you redeploy.

Full instructions, including the domain and wildcard certificate:
[`DEPLOY.md`](https://github.com/pavan29903/Resto-api/blob/main/DEPLOY.md) in
the API repository.
