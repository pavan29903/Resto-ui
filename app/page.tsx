import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import "./home.css";

export const metadata: Metadata = {
  title: "RestoFood — your menu card, on every table's phone",
  description:
    "Photograph the menu card you already have. RestoFood turns it into a menu your customers open by scanning a code on the table, with a photo of every dish.",
};

const STEPS: [string, string, string][] = [
  [
    "01",
    "Photograph the card",
    "Any phone photo will do. Several pages is fine — we read them as one menu.",
  ],
  [
    "02",
    "Check what we read",
    "Every dish and price appears in a list you can correct. Nothing goes live until you say so.",
  ],
  [
    "03",
    "Print the code",
    "Put it on the tables. Your customers scan it and see the menu, photographs and all.",
  ],
];

/** Two terms of one product — not two products. The feature list is therefore
 *  printed once, below both cards, instead of being padded out per column to
 *  make the dearer one look fuller than it is. */
const TERMS: {
  tag?: string;
  name: string;
  price: string;
  per: string;
  note?: string;
  lead?: boolean;
}[] = [
  {
    name: "6 months",
    price: "₹1,999",
    per: "₹333 a month",
  },
  {
    tag: "Best value",
    name: "1 year",
    price: "₹2,999",
    per: "₹250 a month",
    note: "Save ₹999",
    lead: true,
  },
];

const INCLUDED: string[] = [
  "Your menu at your own address — spicegarden.restofood.in",
  "A photograph for every dish, replaceable with your own",
  "Printable codes for the tables",
  "Change a price in ten seconds, with nothing to reprint",
];

/** Replace with the number you actually answer. WhatsApp rather than a form
 *  or an email address: it is where this customer already does business, and
 *  a reply arrives in seconds instead of a day. */
const WHATSAPP = "918466901383";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
  "Hi — I run a restaurant and I'd like to put my menu on RestoFood.",
)}`;

/** The same four dishes appear on the paper and on the phone. That repetition
 *  is the whole argument of the picture: nothing was invented in between, the
 *  menu simply moved. Photographs are real, fetched through the same Pexels
 *  account the product uses and committed to /public — so the mock shows
 *  exactly what a published menu looks like, with no network call to render. */
const DISHES: { src: string; name: string; price: string; veg: boolean }[] = [
  { src: "/demo/dish-1.jpg", name: "Hyderabadi Biryani", price: "₹280", veg: false },
  { src: "/demo/dish-2.jpg", name: "Paneer Butter Masala", price: "₹240", veg: true },
  { src: "/demo/dish-3.jpg", name: "Butter Chicken", price: "₹320", veg: false },
  { src: "/demo/dish-4.jpg", name: "Dal Tadka", price: "₹160", veg: true },
];

/** Two more, paper only. A card listing exactly what the phone shows would
 *  look like a diagram; a real menu runs longer than one screen. */
const PAPER_ONLY: [string, string, boolean][] = [
  ["Jeera Rice", "₹150", true],
  ["Tandoori Roti", "₹30", true],
];

/** The green-square / brown-triangle mark every Indian menu is legally
 *  required to carry. Its presence is most of what separates a card that
 *  looks Indian from a card that looks like a wireframe. */
function VegMark({ veg, small }: { veg: boolean; small?: boolean }) {
  return (
    <span
      className={`vmark${veg ? "" : " vmark--nv"}${small ? " vmark--sm" : ""}`}
      aria-hidden="true"
    >
      <i />
    </span>
  );
}

/** The pitch, demonstrating itself: the card on the counter, an arrow, and
 *  the website it becomes. Separated rather than overlapping, because the
 *  point is the journey between the two — and one arrow says "this is a
 *  single step" more plainly than a paragraph can. */
function Stage() {
  return (
    <div className="stage">
      <div className="stage__deck">
        <figure className="stage__side">
          <article className="card">
            <div className="card__inner">
              <p className="card__est">Est. 1998</p>
              <p className="card__name">Spice Garden</p>
              <p className="card__orn" aria-hidden="true" />
              <p className="card__sec">Main course</p>
              {DISHES.map((d) => (
                <p className="lead" key={d.name}>
                  <VegMark veg={d.veg} />
                  <span className="lead__k">{d.name}</span>
                  <span className="lead__d" aria-hidden="true" />
                  <span className="lead__v">{d.price}</span>
                </p>
              ))}
              {PAPER_ONLY.map(([k, v, veg]) => (
                <p className="lead" key={k}>
                  <VegMark veg={veg} />
                  <span className="lead__k">{k}</span>
                  <span className="lead__d" aria-hidden="true" />
                  <span className="lead__v">{v}</span>
                </p>
              ))}
              <p className="card__foot">Taxes extra · Prices in ₹</p>
            </div>
          </article>
          <figcaption className="stage__cap">The card on your counter</figcaption>
        </figure>

        {/* One photo in, a menu out. The travelling pip repeats so the eye is
            pulled left-to-right across the gap rather than stopping at it. */}
        <div className="flow" aria-hidden="true">
          <span className="flow__label">one photo</span>
          <div className="flow__track">
            <span className="flow__pip" />
            <span className="flow__head" />
          </div>
          <span className="flow__sub">five minutes</span>
        </div>

        <figure className="stage__side">
          <div className="ph">
            <div className="ph__screen">
              <div className="ph__status">
                <span>9:41</span>
                <span className="ph__sig">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>

              <div className="ph__head">
                <span className="ph__logo">SG</span>
                <span className="ph__id">
                  <span className="ph__name">Spice Garden</span>
                  <span className="ph__meta">Open till 11 pm · 24 dishes</span>
                </span>
              </div>

              <div className="ph__chips">
                <span className="ph__chip ph__chip--on">All</span>
                <span className="ph__chip">Starters</span>
                <span className="ph__chip">Main</span>
              </div>

              <div className="ph__grid">
                {DISHES.map((d) => (
                  <div className="ph__card" key={d.name}>
                    <span className="ph__shotwrap">
                      <Image
                        className="ph__shot"
                        src={d.src}
                        alt=""
                        width={210}
                        height={210}
                      />
                      <VegMark veg={d.veg} small />
                    </span>
                    <span className="ph__body">
                      <span className="ph__dish">{d.name}</span>
                      <span className="ph__price">{d.price}</span>
                    </span>
                  </div>
                ))}
              </div>

              <div className="ph__bar">
                <span className="ph__barpill" />
              </div>
              <span className="ph__glare" aria-hidden="true" />
            </div>
          </div>
          <figcaption className="stage__cap">What your customer sees</figcaption>
        </figure>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="home">
      <nav className="hnav">
        <div className="hnav__in">
          <Link className="hnav__mark" href="/">RestoFood</Link>
          <div className="hnav__links">
            <a className="hnav__link" href="#how">How it works</a>
            <a className="hnav__link" href="#why">Why bother</a>
            <a className="hnav__link" href="#pricing">Pricing</a>
          </div>
          <Link
            className="hnav__cta btn btn--glow btn--sm"
            href="/dashboard"
            style={{ textDecoration: "none" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      <header className="hero">
        {/* A jali screen — the pierced stone lattice of Mughal architecture,
            whose whole purpose is to let warm light through a wall. Here the
            glow behind the page shines through it. */}
        <div className="jali" aria-hidden="true">
          <div className="jali__glow" />
          <div className="jali__grid" />
        </div>

        <div className="hero__in">
          <Reveal>
            <p className="eyebrow">For restaurants still handing out paper</p>
            <h1 className="hero__h1">
              <span className="hero__ln">Your menu card belongs on</span>{" "}
              <span className="hero__ln">
                <em>your customer&apos;s phone</em>
              </span>
            </h1>
            <p className="hero__sub">
              Photograph the card you already have. We turn it into a menu your
              customers open by scanning a code on the table — with a
              photograph of every dish.
            </p>
            <div className="hero__cta">
              <Link
                className="btn btn--glow"
                href="/dashboard"
                style={{ textDecoration: "none" }}
              >
                Put my menu online
              </Link>
              <a className="linkbtn" href="#pricing">
                See what it costs
              </a>
            </div>
            <p className="hero__fine">
              About five minutes, and you need nothing but your menu card.
            </p>
          </Reveal>
        </div>

        <Reveal delay={120}>
          <Stage />
        </Reveal>
      </header>

      <section id="how">
        <div className="band__in">
          <Reveal>
            <div className="rule">
              <span className="rule__t">How it works</span>
            </div>
          </Reveal>

          <ol className="steps">
            {STEPS.map(([n, h, p], i) => (
              <Reveal as="li" className="step glass" delay={i * 90} key={n}>
                <span className="step__n">{n}</span>
                <h2 className="step__h">{h}</h2>
                <p className="step__p">{p}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section id="why">
        <div className="band__in">
          <Reveal>
            <div className="rule">
              <span className="rule__t">Worth knowing</span>
            </div>
          </Reveal>

          <div className="bento">
            <Reveal className="bento__cell bento__cell--wide glass">
              <p className="bento__big">₹0</p>
              <p className="bento__k">Nothing goes live by accident</p>
              <p className="bento__p">
                We read the card, then hand you the list. You fix anything
                that&apos;s wrong before a single customer sees it — and it
                costs nothing to try.
              </p>
            </Reveal>

            <Reveal className="bento__cell glass" delay={90}>
              <p className="bento__k">Photographs are yours</p>
              <p className="bento__p">
                We find one for each dish. Put in your own and we&apos;ll never
                overwrite it.
              </p>
            </Reveal>

            <Reveal className="bento__cell glass" delay={140}>
              <p className="bento__k">Nothing to reprint</p>
              <p className="bento__p">
                Change a price and the code on the table keeps working.
              </p>
            </Reveal>

            <Reveal className="bento__cell bento__cell--wide glass" delay={190}>
              <p className="bento__k">Your name, not a number</p>
              <p className="bento__p">
                Your menu lives at your restaurant&apos;s own address — the kind
                you can read aloud to a customer — instead of a row in somebody
                else&apos;s system.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="band__in">
          <Reveal>
            <div className="rule">
              <span className="rule__t">Pricing</span>
            </div>
          </Reveal>

          {/* The comparison that matters. A cafe is not choosing between this
              and other software — it is choosing between this and printing
              the cards again, which costs more. */}
          <Reveal>
            <p className="anchor">
              One reprint of your menu cards costs more than a year of
              RestoFood.
            </p>
            <p className="anchor__sub">
              Every plan starts with a free month. No card, nothing to cancel.
            </p>
          </Reveal>

          <div className="tiers">
            {TERMS.map((t, i) => (
              <Reveal
                as="article"
                className={`tier glass${t.lead ? " tier--lead" : ""}`}
                delay={i * 90}
                key={t.name}
              >
                {t.tag ? <p className="tier__tag">{t.tag}</p> : null}
                <h2 className="tier__name">{t.name}</h2>
                <p className="tier__price">{t.price}</p>
                <p className="tier__per">
                  {t.per}
                  {t.note ? <span className="tier__save">{t.note}</span> : null}
                </p>
                <p className="tier__cta">
                  <Link
                    className={`btn btn--sm${t.lead ? " btn--glow" : ""}`}
                    href="/dashboard"
                    style={{ textDecoration: "none" }}
                  >
                    Start free month
                  </Link>
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="included">
              <p className="included__head">Both include</p>
              <ul className="included__list">
                {INCLUDED.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p className="included__ask">
                More than one outlet, or a question first?{" "}
                <a
                  className="linkbtn"
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ask on WhatsApp
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <Reveal as="section" className="close">
        <h2 className="close__h">Your menu could be live tonight</h2>
        <p className="close__p">
          Photograph the card, check the prices, print the code. That is the
          whole job.
        </p>
        <p style={{ marginBlockStart: "1.8rem" }}>
          <Link
            className="btn btn--glow"
            href="/dashboard"
            style={{ textDecoration: "none" }}
          >
            Start with my menu
          </Link>
        </p>
      </Reveal>

      <footer className="hfoot">RestoFood — menus for small restaurants.</footer>
    </div>
  );
}
