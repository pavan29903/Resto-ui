import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import "./home.css";

export const metadata: Metadata = {
  title: "RestoFood — your menu card, on every table's phone",
  description:
    "Photograph the menu card you already have. RestoFood turns it into a menu your customers open by scanning a code on the table, with a photo of every dish.",
};

/** What the owner gets, written as a menu: a claim on the left, its concrete
 *  answer on the right, joined by leader dots. The answers are specific on
 *  purpose — "found for you" and a real-looking address say more than an
 *  adjective would. */
const GETS: [string, string][] = [
  ["A photo for every dish", "found for you"],
  ["Your own web address", "spicegarden.restofood.in"],
  ["A code for the tables", "ready to print"],
  ["Changing a price", "ten seconds"],
  ["Reading it on a phone", "light or dark"],
];

const STEPS: [string, string, string][] = [
  [
    "1",
    "Photograph the card",
    "Any phone photo will do. Several pages is fine — we read them as one menu.",
  ],
  [
    "2",
    "Check what we read",
    "Every dish and price appears in a list you can correct. Nothing goes live until you say so.",
  ],
  [
    "3",
    "Print the code",
    "Put it on the tables. Your customers scan it and see the menu, photographs and all.",
  ],
];

/** The pitch, demonstrating itself: on the left the paper card, listing what
 *  you get; on the right that same card as a phone menu. */
function Transformation() {
  return (
    <div className="tf">
      <article className="card rise rise--2">
        <p className="card__name">RestoFood</p>
        <p className="card__est">what you get</p>
        <p className="card__sec">Included</p>
        {GETS.map(([k, v]) => (
          <p className="lead" key={k}>
            <span className="lead__k">{k}</span>
            <span className="lead__d" aria-hidden="true" />
            <span className="lead__v">{v}</span>
          </p>
        ))}
      </article>

      <div className="tf__arrow rise rise--3" aria-hidden="true">
        →
      </div>

      <div className="ph rise rise--3" aria-hidden="true">
        <div className="ph__notch" />
        <p className="ph__name">Spice Garden</p>
        <p className="ph__meta">24 dishes · prices in INR</p>
        <div className="ph__grid">
          {["a", "b", "c", "d"].map((v) => (
            <div className="ph__card" key={v}>
              <div className={`ph__shot ph__shot--${v}`} />
              <div className="ph__body">
                <div className="ph__l" style={{ inlineSize: "84%" }} />
                <div className="ph__l ph__l--p" />
              </div>
            </div>
          ))}
        </div>
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
          <ThemeToggle />
          <Link
            className="btn btn--primary btn--sm"
            href="/dashboard"
            style={{ textDecoration: "none" }}
          >
            Get started
          </Link>
        </div>
      </nav>

      <header className="hero">
        <div className="hero__head rise">
          <p className="eyebrow">For restaurants still handing out paper</p>
          <h1 className="hero__h1">
            You don&apos;t need a website. You need your menu on{" "}
            <span>their phone</span>.
          </h1>
          <p className="hero__sub">
            Photograph the card you already have. We turn it into a menu your
            customers open by scanning a code on the table — with a photograph
            of every dish.
          </p>
          <div className="hero__cta">
            <Link
              className="btn btn--primary"
              href="/dashboard"
              style={{ textDecoration: "none" }}
            >
              Put my menu online
            </Link>
            <Link className="linkbtn" href="/r/demo">
              Look at an example
            </Link>
          </div>
          <p className="hero__fine">
            About five minutes, and you need nothing but your menu card.
          </p>
        </div>

        <Transformation />
      </header>

      <section className="band">
        <div className="band__in">
          <div className="rule">
            <span className="rule__t">How it works</span>
          </div>

          <ol className="courses">
            {STEPS.map(([n, h, p]) => (
              <li className="course" key={n}>
                <span className="course__n">{n}</span>
                <div>
                  <h2 className="course__h">{h}</h2>
                  <p className="course__p">{p}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band--plain">
        <div className="band__in">
          <div className="rule">
            <span className="rule__t">Worth knowing</span>
          </div>

          <div className="courses">
            <div className="course">
              <span className="course__n">·</span>
              <div>
                <h2 className="course__h">Nothing goes live by accident</h2>
                <p className="course__p">
                  We read the card, then hand you the list. You fix anything
                  that&apos;s wrong before a single customer sees it.
                </p>
              </div>
            </div>
            <div className="course">
              <span className="course__n">·</span>
              <div>
                <h2 className="course__h">The photographs are yours to change</h2>
                <p className="course__p">
                  We find one for each dish. If a dish deserves your own
                  photograph, put it in — we&apos;ll never overwrite it.
                </p>
              </div>
            </div>
            <div className="course">
              <span className="course__n">·</span>
              <div>
                <h2 className="course__h">Prices change; so does the menu</h2>
                <p className="course__p">
                  Open it, type the new number, save. The code on the table
                  keeps working — there is nothing to reprint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="close">
        <h2 className="close__h">Your menu could be live tonight</h2>
        <p className="close__p">
          Photograph the card, check the prices, print the code. That is the
          whole job.
        </p>
        <p style={{ marginBlockStart: "1.7rem" }}>
          <Link
            className="btn btn--primary"
            href="/dashboard"
            style={{ textDecoration: "none" }}
          >
            Start with my menu
          </Link>
        </p>
      </section>

      <footer className="hfoot">RestoFood — menus for small restaurants.</footer>
    </div>
  );
}
