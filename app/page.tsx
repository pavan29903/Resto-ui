import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./home.css";

export const metadata: Metadata = {
  title: "RestoFood — your paper menu, on your customers' phones",
  description:
    "Photograph your menu card and get a menu your customers open by scanning a QR code on the table. No typing, no website to build.",
};

/** The hero: a paper menu card turning into a phone.
 *
 *  It's the whole product in one look, and it's the thing the owner is
 *  literally holding while they read this page. Built in CSS rather than as
 *  an image so it stays crisp and themes with the rest of the site. */
function Transformation() {
  return (
    <div className="transform" aria-hidden="true">
      <div className="paper">
        <p className="paper__title">MENU</p>
        <div className="paper__line paper__line--head" />
        <div className="paper__line" style={{ inlineSize: "88%" }} />
        <div className="paper__line" style={{ inlineSize: "72%" }} />
        <div className="paper__line" style={{ inlineSize: "80%" }} />
        <div className="paper__line paper__line--head" />
        <div className="paper__line" style={{ inlineSize: "84%" }} />
        <div className="paper__line" style={{ inlineSize: "65%" }} />
        <div className="paper__line" style={{ inlineSize: "78%" }} />
        <div className="paper__line" style={{ inlineSize: "58%" }} />
      </div>

      <div className="transform__arrow">→</div>

      <div className="phone">
        <div className="phone__bar" />
        <p className="phone__name">Spice Garden</p>
        <div className="phone__grid">
          {["", "--b", "--c", "--d"].map((v) => (
            <div className="phone__card" key={v}>
              <div className={`phone__shot phone__shot${v}`} />
              <div className="phone__meta">
                <div className="phone__l" style={{ inlineSize: "82%" }} />
                <div className="phone__l phone__l--price" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    n: "01",
    h: "Photograph your card",
    p: "Any phone photo works. Several pages is fine — we read them as one menu.",
  },
  {
    n: "02",
    h: "Check what we read",
    p: "Every dish and price appears in a list you can correct. Nothing goes live until you say so.",
  },
  {
    n: "03",
    h: "Print the QR",
    p: "Put it on the tables. Customers scan and see your menu, photos and all.",
  },
];

const FEATURES = [
  {
    h: "Photos for every dish",
    p: "We find a real photograph for each item. Swap in your own whenever you like.",
  },
  {
    h: "Your own web address",
    p: "Your menu lives at your restaurant's name, not a number in someone's system.",
  },
  {
    h: "Change it in seconds",
    p: "Prices change. Open the menu, edit the number, save. No one to call.",
  },
  {
    h: "Built for phones",
    p: "Your customers read it one-handed at the table, in daylight or a dim room.",
  },
];

export default function Home() {
  return (
    <div className="home">
      <nav className="homenav">
        <div className="homenav__inner">
          <Link className="homenav__mark" href="/">RestoFood</Link>
          <ThemeToggle />
          <Link className="btn btn--primary btn--sm" href="/dashboard" style={{ textDecoration: "none" }}>
            Get started
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div>
          <p className="eyebrow">For cafes still handing out paper</p>
          <h1 className="hero__title">
            Your menu card, on your customers&apos; <em>phones</em>.
          </h1>
          <p className="hero__lede">
            Take a photo of the menu you already have. We turn it into a page
            your customers open by scanning a code on the table — with a
            picture of every dish.
          </p>
          <div className="hero__cta">
            <Link className="btn btn--primary" href="/dashboard" style={{ textDecoration: "none" }}>
              Put my menu online
            </Link>
            <Link className="linkbtn" href="/r/demo">
              See an example menu
            </Link>
          </div>
          <p className="hero__note">
            Takes about five minutes. You need nothing but your menu card.
          </p>
        </div>

        <Transformation />
      </header>

      <section className="band">
        <div className="band__inner">
          <h2 className="band__title">Three steps, one evening</h2>
          <p className="band__lede">
            You are not building a website. You are photographing the card
            that&apos;s already on your counter.
          </p>

          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="step__n">{s.n}</span>
                <h3 className="step__h">{s.h}</h3>
                <p className="step__p">{s.p}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band" style={{ background: "var(--ground)" }}>
        <div className="band__inner">
          <h2 className="band__title">What your customers get</h2>
          <p className="band__lede">
            The things the big chains paid a developer for, without the
            developer.
          </p>

          <div className="feats">
            {FEATURES.map((f) => (
              <article className="feat" key={f.h}>
                <h3 className="feat__h">{f.h}</h3>
                <p className="feat__p">{f.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="close">
        <h2 className="close__title">Your menu could be live tonight</h2>
        <p className="close__p">
          Photograph the card, check the prices, print the code. That&apos;s the
          whole job.
        </p>
        <p style={{ marginBlockStart: "1.75rem" }}>
          <Link className="btn btn--primary" href="/dashboard" style={{ textDecoration: "none" }}>
            Start with my menu
          </Link>
        </p>
      </section>

      <footer className="homefoot">
        RestoFood — menus for small restaurants.
      </footer>
    </div>
  );
}
