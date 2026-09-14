# RestoFood — web

**Photograph your menu card. Get a menu your customers open by scanning a code
on the table — with a photograph of every dish.**

Live at **[restofood.in](https://restofood.in)** · API:
**[Resto-api](https://github.com/pavan29903/Resto-api)**

---

## The problem

India has millions of small restaurants still handing out laminated paper menu
cards. Every time a price moves, the owner reprints the batch — ₹3,000–5,000, a
few times a year. The cafe two doors down has a QR code on every table and
looks like a different class of business.

Closing that gap normally takes a designer, a photographer and somebody who can
operate a CMS. A twelve-table cafe has none of those.

**RestoFood needs one thing: a photograph of the menu card they already own.**

## What this repository is

The half of the product people actually look at. One Next.js app serving three
very different audiences:

| Route | Who | What they're doing |
|---|---|---|
| `/` | someone deciding | Reading the pitch |
| `/dashboard` | the restaurant owner | Photographing a card, checking prices, publishing |
| `/r/[slug]` | **a diner at the table** | Reading the menu they just scanned |

Plus every restaurant's own address — `spicegarden.restofood.in` — served by
the same app through a middleware rewrite behind a wildcard certificate.

## Designed for the actual conditions

The diner's menu is the screen that matters, and it gets read **one-handed, at
a table, on a mid-range Android phone, often in low light, often by someone
who's hungry.** Every decision answers to that: a two-column grid so dishes are
thumb-sized, photographs that load fast on café wifi, the green-square and
brown-triangle veg marks every Indian menu carries by law, and a dark theme
that isn't an afterthought because half of them will be reading it in a dim
room.

The owner's console is built for someone between services on a cheap laptop,
who has never used a CMS and shouldn't have to learn one. It explains itself in
plain sentences — "Photograph your menu card", not "Upload asset" — and nothing
goes live until they have seen every dish and price.

---

## What's interesting underneath

**A design system with a reason for every value.** Warm paper and saffron, not
the cool greys most dashboards default to, because food photography looks
refrigerated against grey. The accent is pinned at the exact value where it
clears 4.5:1 on the paper ground. Dark mode is a *warm* near-black, so a diner
flipping themes at the table sees the same restaurant rather than a different
app. Every colour is a token defined once — which is why retheming the entire
product was an edit to three blocks and nothing else.

**Typography chosen under a real constraint.** Rozha One and Mukta both carry
**Devanagari as well as Latin**, because real Indian menus are bilingual and a
face that renders tofu boxes for half the dishes isn't a candidate, however
handsome it is.

**A signature that isn't a gradient blob.** Behind the landing hero is a
*jali* — the pierced stone lattice of Mughal architecture, which exists to let
warm light through a wall. One inline SVG, a few hundred bytes. It replaced
blurred aurora gradients, which are the default decoration of every AI-era
landing page and say nothing about an Indian restaurant.

**Multi-tenancy in the edge middleware.** A subdomain is rewritten onto
`/r/[slug]` — so the diner sees the restaurant's own address, not a path in
somebody else's system. Both forms keep serving forever, which means a QR code
printed before the domain existed never goes dead. Around thirty reserved
subdomains can never be claimed by a restaurant.

**Loading states that tell the truth.** An empty list and a pending request
used to look identical, so the console told owners they had no menus while it
was still fetching. Now: skeletons shaped like the real cards, a genuine error
state with a retry, and — after four seconds — an honest line explaining that
the free-tier server sleeps and this first load can take a minute. A spinner
that looks stuck is worse than a sentence explaining why.

**No Tailwind**, deliberately. Utility defaults are what produced the templated
first draft this replaced.

---

## Built with

Next.js 15 (App Router) · React 19 · TypeScript · Supabase Auth · Vercel

Two repositories, deliberately: the web app and the API deploy independently.

## Built, and not yet built

**Working today:** menu extraction and review, dish photographs, per-dish
replacement, logos, publishing, QR codes and printable table cards, a menu per
subdomain, light and dark themes, owner accounts, trials and renewals, and a
back office for collecting payment.

**Not built:** ordering. A diner reads the menu and then speaks to a server.
There's no cart here and no orders table in the API — that's the next
substantial piece of work, and it isn't claimed as "coming soon" on a page
where somebody might believe it.

---

**Running it locally:** [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
