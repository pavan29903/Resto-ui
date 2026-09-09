# RestoFood — web

The customer-facing half of RestoFood. Next.js, deployed on Vercel.

It serves three different people from one codebase:

| Route | Who | What they're doing |
|---|---|---|
| `/` | someone deciding | Reading the pitch |
| `/dashboard` | the restaurant owner | Uploading a menu card, checking prices, publishing |
| `/r/[slug]` | a diner at the table | Browsing the menu they just scanned |

Once a domain is attached, each restaurant also answers on its own subdomain —
`spicegarden.restofood.in` — which is the same `/r/[slug]` page reached through
a rewrite in [`middleware.ts`](middleware.ts).

The API lives in a separate repository: **[Resto-api](https://github.com/pavan29903/Resto-api)**.

---

## Running it locally

You need the API running first — the console can't sign in without it.

```bash
# 1. install
npm install

# 2. configure
cp .env.local.example .env.local     # PowerShell: Copy-Item .env.local.example .env.local

# 3. run
npm run dev                          # → http://localhost:5005
```

Port 5005 rather than Next's default 3000, which tends to be occupied. The
API allows both from a browser, so either works if you change it.

`.env.local` needs three values:

```ini
NEXT_PUBLIC_API_URL=http://localhost:8222
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Everything here is public by design — the anon key is meant to reach the
browser. The service key never appears in this repository.

**Testing subdomains locally** needs no DNS setup: `spice-garden.localhost:3000`
resolves on its own, and the middleware treats it exactly as it will treat a
real subdomain.

```bash
npm run typecheck    # tsc --noEmit
npm run build        # production build
```

---

## How it's put together

```
app/
  page.tsx            the landing page
  home.css
  dashboard/          the owner's console — upload, review, publish, edit
  r/[slug]/           the diner's menu
  globals.css         design tokens, both themes, shared primitives
  layout.tsx          fonts, and the script that prevents a theme flash
components/
  MenuEditor          the dish table, shared by first review and later edits
  EditRestaurant      name, address, WhatsApp, logo, and the menu
  DishPhotoCell       replace one dish's photograph
  LogoUpload · SignIn · ThemeToggle
lib/
  api.ts              every call to the API, typed
  types.ts            mirrors the API's schema
  supabase.ts         browser auth client
middleware.ts         subdomain → restaurant
```

Auth is Supabase. The browser holds the session; every request to the API
carries its token, and the API verifies it against Supabase's public keys.

---

## Design

The visual system is documented here because it's easy to erode without a
written reason for each decision.

**Colour — paper and saffron.** The warm off-white of a printed menu card
gives the neutrals; saffron, the colour of the food and of the country, gives
the accent. Warm throughout, because the product is about appetite and cool
greys make food photography look refrigerated. Dark is a *warm* dark — a
brown-biased near-black rather than the usual blue-black — so a diner
switching themes at the table sees the same restaurant, not a different app.

The accent sits at `#b8500b` rather than a brighter burnt orange because that
is where it clears 4.5:1 against the paper ground, and the accent carries
body-sized link text, not just headings. On dark it lightens to `#f0a35a`;
the darker value would vanish into the ground.

**One palette, three surfaces.** The landing page, the console and the
diner's menu all read the same tokens. Every value is a custom property
defined once in `globals.css` and repeated only in the two theme overrides;
components read `var(--token)` and never a literal. That is what makes
retheming the entire product an edit to three blocks — which is exactly how
this palette replaced the previous one.

Two deliberate exceptions, both documented where they appear. The paper card
in the landing-page hero keeps literal colours, because it *depicts* printed
paper and paper is white under a dark theme too; likewise the phone mock,
which is a picture of a device rather than themed UI. And the QR code in the
console has a hardcoded white quiet zone — on a dark surface it would not
scan.

**The jali.** Behind the hero is a lattice of interlocking circles — the
pierced stone screen of Mughal architecture, whose purpose is to let warm
light through a wall. It does the same job here: the page's glow is behind it
and shines through. It is drawn as one inline SVG pattern, so it costs a few
hundred bytes and no request. It replaced a set of blurred gradient blobs,
which are the default decoration of every AI-era landing page and say nothing
about an Indian restaurant.

**Type — Rozha One and Mukta.** One characterful display face, used once per
page, and one workhorse. Both were chosen under a constraint that rules out
most handsome faces: **they carry Devanagari as well as Latin.** Real Indian
menus are bilingual, and a face that renders tofu boxes for half the menu is
not a candidate. Self-hosted at build time — no runtime font CDN.

**The leader rail.** Printed menus join a dish to its price with a row of
dots. The landing page uses that device to join a claim to its answer. It is
the one place the design spends its boldness.

**Themes.** Light, system-dark, and an explicit choice are all handled, and a
script in `layout.tsx` applies the stored preference before first paint —
without it, a diner who chose dark gets a white flash on every load, worst
exactly where it is most visible.

**No Tailwind**, deliberately: utility defaults are what produced the
templated first draft this replaced.

---

## Deploying

Vercel builds this from GitHub on every push to `main`. Set the same three
environment variables in the project settings, pointing at the deployed API
rather than localhost.

Full instructions, including the domain and wildcard certificate:
[`DEPLOY.md`](https://github.com/pavan29903/Resto-api/blob/main/DEPLOY.md) in
the API repository.

---

## Not built yet

Ordering. A diner can read the menu and see every dish, but cannot place an
order from it — there is no cart here and no orders table in the API. The menu
currently ends at *"Ready to order? Call your server."*
