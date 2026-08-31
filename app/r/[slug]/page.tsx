import Link from "next/link";
import type { Metadata } from "next";
import { getPublicMenu } from "@/lib/api";
import ThemeToggle from "@/components/ThemeToggle";
import { formatPrice, type MenuItem } from "@/lib/types";
import "./menu.css";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublicMenu(slug);
  const name = data?.menu.restaurant_name || "Menu";
  return { title: `${name} — Menu`, description: `The menu at ${name}.` };
}

function sectionId(name: string, index: number) {
  return `s${index}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function DietMark({ veg }: { veg: boolean | null }) {
  if (veg === null) return null;
  return (
    <span
      className={`diet ${veg ? "diet--veg" : "diet--nonveg"}`}
      role="img"
      aria-label={veg ? "Vegetarian" : "Non-vegetarian"}
    />
  );
}

function Tags({ item }: { item: MenuItem }) {
  if (!item.spice_level) return null;
  return (
    <div className="dish__tags">
      <span className="tag tag--spicy">{item.spice_level}</span>
    </div>
  );
}

export default async function MenuPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPublicMenu(slug);

  if (!data) {
    return (
      <main className="empty">
        <h1 className="empty__title">No menu here yet</h1>
        <p className="empty__body">
          Nothing has been published at <code>{slug}</code>. If this is your
          restaurant, photograph your menu card and publish it — it takes a minute.
        </p>
        <p style={{ marginBlockStart: "1.25rem" }}>
          <Link className="btn btn--primary" href="/dashboard" style={{ textDecoration: "none" }}>
            Open RestoFood
          </Link>
        </p>
      </main>
    );
  }

  const { menu, images, whatsapp } = data;
  const name = data.name || menu.restaurant_name || "Menu";
  const logo = data.logo_url;
  const sections = menu.sections.filter((s) => s.items.length > 0);
  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div className="menu-page">
      <header className="masthead">
        <div className="masthead__inner">
          {logo && (
            <div className="masthead__logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logo} alt="" width={112} height={112} />
            </div>
          )}
          <div className="masthead__text">
            <h1 className="masthead__name">{name}</h1>
            <p className="masthead__meta">
              {total} dishes · prices in {menu.currency}
            </p>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {sections.length > 1 && (
        <nav className="sectionnav" aria-label="Menu sections">
          <div className="sectionnav__scroll">
            {sections.map((section, i) => (
              <a key={i} className="sectionnav__chip" href={`#${sectionId(section.name, i)}`}>
                {section.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main className="menu-body">
        {sections.map((section, si) => {
          const [lead, ...rest] = section.items;
          const leadImg = images[`${si}-0`];

          return (
            <section key={si} className="section" id={sectionId(section.name, si)}>
              <div className="section__head">
                <h2 className="section__name">{section.name}</h2>
                <span className="section__rule" />
                <span className="section__count num">{section.items.length}</span>
              </div>

              {/* Two dishes across on a phone. The first of each section spans
                  both columns — a section deserves one dish shown properly,
                  and it gives the eye somewhere to land when scrolling. */}
              <div className="dishgrid">
                <article className="dishcard dishcard--feature">
                  {leadImg && (
                    <div className="dishcard__figure">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={leadImg} alt={lead.name} loading="lazy" />
                    </div>
                  )}
                  <div className="dishcard__body">
                    <h3 className="dishcard__name">
                      <DietMark veg={lead.is_vegetarian} />
                      <span>{lead.name}</span>
                    </h3>
                    {lead.description && (
                      <p className="dishcard__desc">{lead.description}</p>
                    )}
                    <div className="dishcard__foot">
                      <span
                        className={`dishcard__price num${
                          lead.price === null ? " dishcard__price--none" : ""
                        }`}
                      >
                        {lead.price === null ? "—" : formatPrice(lead.price, menu.currency)}
                      </span>
                      <Tags item={lead} />
                    </div>
                  </div>
                </article>

                {rest.map((item, ri) => {
                  const idx = ri + 1;
                  const img = images[`${si}-${idx}`];
                  return (
                    <article className="dishcard" key={idx}>
                      {img && (
                        <div className="dishcard__figure">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" loading="lazy" />
                        </div>
                      )}
                      <div className="dishcard__body">
                        <h3 className="dishcard__name">
                          <DietMark veg={item.is_vegetarian} />
                          <span>{item.name}</span>
                        </h3>
                        {item.description && (
                          <p className="dishcard__desc">{item.description}</p>
                        )}
                        <div className="dishcard__foot">
                          <span
                            className={`dishcard__price num${
                              item.price === null ? " dishcard__price--none" : ""
                            }`}
                          >
                            {item.price === null ? "—" : formatPrice(item.price, menu.currency)}
                          </span>
                          <Tags item={item} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="menu-foot">
          Dish photos are illustrative. Menu by <Link href="/">RestoFood</Link>.
        </p>
      </main>

      <div className="orderbar">
        <div className="orderbar__inner">
          <p className="orderbar__hint">
            {whatsapp ? "Order straight from your phone." : "Ready to order? Call your server."}
          </p>
          {whatsapp && (
            <a
              className="btn btn--primary orderbar__cta"
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                `Hi, I'd like to order from ${name}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Order on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
