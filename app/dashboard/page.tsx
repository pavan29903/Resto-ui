"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import EditRestaurant from "@/components/EditRestaurant";
import LogoUpload from "@/components/LogoUpload";
import MenuEditor from "@/components/MenuEditor";
import SignIn from "@/components/SignIn";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";
import {
  API,
  createRestaurant,
  deleteRestaurant,
  extractMenu,
  fetchQrObjectUrl,
  getConfig,
  getPublishJob,
  listRestaurants,
  startPublish,
} from "@/lib/api";
import {
  countItems,
  symbolFor,
  type ApiConfig,
  type Menu,
  type PublishJob,
  type RestaurantSummary,
} from "@/lib/types";
import "./console.css";

type Stage = "list" | "upload" | "review" | "publish" | "edit";

export default function Console() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [config, setConfig] = useState<ApiConfig | null>(null);

  const [stage, setStage] = useState<Stage>("list");
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [menu, setMenu] = useState<Menu | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [withImages, setWithImages] = useState(true);
  const [maxImages, setMaxImages] = useState(0);
  const [job, setJob] = useState<PublishJob | null>(null);
  const [published, setPublished] = useState<RestaurantSummary | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const client = supabase();
    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    getConfig().then(setConfig).catch(() => setConfig(null));
  }, []);

  const refresh = useCallback(async () => {
    try {
      setRestaurants(await listRestaurants());
    } catch {
      /* not signed in yet */
    }
  }, []);

  useEffect(() => {
    if (session) refresh();
  }, [session, refresh]);

  if (!ready) return <main className="shell centered"><p className="status">Loading…</p></main>;
  if (!session)
    return (
      <main className="shell centered">
        <div className="authwrap">
          <div className="authwrap__head">
            <p className="wordmark">RestoFood</p>
            <ThemeToggle />
          </div>
          <SignIn />
        </div>
      </main>
    );

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles(Array.from(list));
    setError(null);
  }

  async function readCard() {
    setReading(true);
    setError(null);
    try {
      const { menu } = await extractMenu(files);
      setMenu(menu);
      setName(menu.restaurant_name || "");
      setStage("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't read that menu.");
    } finally {
      setReading(false);
    }
  }

  function edit(si: number, ii: number | null, field: string, value: unknown) {
    if (!menu) return;
    const next: Menu = structuredClone(menu);
    if (ii === null) (next.sections[si] as Record<string, unknown>)[field] = value;
    else (next.sections[si].items[ii] as Record<string, unknown>)[field] = value;
    setMenu(next);
  }

  function removeItem(si: number, ii: number) {
    if (!menu) return;
    const next: Menu = structuredClone(menu);
    next.sections[si].items.splice(ii, 1);
    setMenu(next);
  }

  async function saveAndPublish() {
    if (!menu) return;
    setSaving(true);
    setError(null);
    try {
      const restaurant = await createRestaurant({
        name: name || "My Restaurant",
        menu: { ...menu, restaurant_name: name || menu.restaurant_name },
      });
      setPublished(restaurant);
      setStage("publish");

      const started = await startPublish(restaurant.id, {
        generate_images: withImages,
        max_images: withImages ? maxImages : 0,
      });
      setJob(started);
      poll(started.job_id, restaurant);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the menu.");
      setStage("review");
    } finally {
      setSaving(false);
    }
  }

  async function poll(jobId: string, restaurant: RestaurantSummary) {
    try {
      const next = await getPublishJob(jobId);
      setJob(next);
      if (next.status === "running") {
        setTimeout(() => poll(jobId, restaurant), 1500);
      } else if (next.status === "done") {
        refresh();
        try {
          setQrUrl(await fetchQrObjectUrl(restaurant.id));
        } catch {
          /* QR is a nicety; the menu is already live */
        }
      }
    } catch (err) {
      setJob((j) =>
        j ? { ...j, status: "error", error: err instanceof Error ? err.message : "Lost track of that job." } : j,
      );
    }
  }

  function startOver() {
    setFiles([]);
    setMenu(null);
    setName("");
    setJob(null);
    setPublished(null);
    setQrUrl(null);
    setError(null);
    setStage("upload");
  }

  const symbol = symbolFor(menu?.currency);
  const itemCount = menu ? countItems(menu) : 0;

  return (
    <div className="console">
      <header className="topbar">
        <div className="shell topbar__inner">
          <button
            className="wordmark linkbtn"
            onClick={() => setStage("list")}
            title="Your menus"
          >
            RestoFood
          </button>
          <div className="topbar__models">
            {config && (
              <>
                <span className="pill">reads with {config.extraction_model}</span>
                <span className="pill">photos from {config.image_provider}</span>
              </>
            )}
            <span className="pill">{session.user.email}</span>
            <ThemeToggle />
            <button
              className="btn btn--quiet btn--sm"
              onClick={() => supabase().auth.signOut()}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="shell">
        {/* ------------------------------------------------------ my menus */}
        {stage === "list" && (
          <section className="intro">
            <p className="eyebrow">Your menus</p>
            <h1 className="intro__title">
              {restaurants.length ? "Welcome back." : "Let's get your menu online."}
            </h1>

            {restaurants.length === 0 ? (
              <>
                <p className="intro__lede">
                  Photograph your menu card and we'll turn it into a page your
                  customers can open from a QR code on the table.
                </p>
                <button
                  className="btn btn--primary"
                  style={{ marginBlockStart: "1.4rem" }}
                  onClick={startOver}
                >
                  Add your first menu
                </button>
              </>
            ) : (
              <>
                <div className="cardgrid">
                  {restaurants.map((r) => (
                    <article className="minicard" key={r.id}>
                      <div>
                        <h3 className="minicard__name">{r.name}</h3>
                        <p className="status">{r.menu_url.replace(/^https?:\/\//, "")}</p>
                      </div>
                      <LogoUpload
                        restaurantId={r.id}
                        initial={r.logo_url}
                        onChange={refresh}
                      />
                      <div className="minicard__foot">
                        <span className={`chip ${r.is_published ? "chip--live" : ""}`}>
                          {r.is_published ? "Live" : "Draft"}
                        </span>
                        <button
                          className="linkbtn"
                          onClick={() => {
                            setEditingId(r.id);
                            setStage("edit");
                          }}
                        >
                          Edit
                        </button>
                        <a
                          className="linkbtn"
                          href={`/r/${r.slug}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View
                        </a>
                        <button
                          className="linkbtn linkbtn--danger"
                          onClick={async () => {
                            if (!confirm(`Delete ${r.name} and its menu?`)) return;
                            await deleteRestaurant(r.id);
                            refresh();
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                <button
                  className="btn btn--primary"
                  style={{ marginBlockStart: "1.6rem" }}
                  onClick={startOver}
                >
                  Add another menu
                </button>
              </>
            )}
          </section>
        )}

        {/* -------------------------------------------------------- upload */}
        {stage === "upload" && (
          <section className="panel" style={{ marginBlockStart: "2rem" }}>
            <div className="panel__head">
              <h2 className="panel__title">Photograph your menu card</h2>
              <span className="panel__note">JPG, PNG or WEBP · several pages fine</span>
            </div>

            <div
              className={`drop${dragging ? " drop--over" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => fileInput.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileInput.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
            >
              <span className="drop__lead">
                {files.length ? "Choose different photos" : "Drop your menu photos here"}
              </span>
              <span className="drop__hint">or click to browse</span>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="filechips">
                {files.map((f) => (
                  <span className="pill" key={f.name}>{f.name}</span>
                ))}
              </div>
            )}

            <div className="actions">
              <button
                className="btn btn--primary"
                disabled={!files.length || reading}
                onClick={readCard}
              >
                {reading ? "Reading your card…" : "Read the card"}
              </button>
              {reading && <span className="status">This takes 10–30 seconds.</span>}
              {error && <span className="status status--error">{error}</span>}
            </div>
          </section>
        )}

        {/* -------------------------------------------------------- review */}
        {stage === "review" && menu && (
          <section className="panel" style={{ marginBlockStart: "2rem" }}>
            <div className="panel__head">
              <h2 className="panel__title">Check the details</h2>
              <span className="panel__note">
                {menu.sections.length} sections · {itemCount} dishes
              </span>
            </div>
            <p className="status" style={{ marginBlockEnd: "1.1rem" }}>
              Prices and spellings come straight off your photo. Fix anything
              that looks wrong — this is what your customers will see.
            </p>

            <div className="metagrid">
              <div>
                <label className="label" htmlFor="rname">Restaurant name</label>
                <input
                  id="rname"
                  className="field"
                  value={name}
                  placeholder="e.g. Spice Garden"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="label" htmlFor="rcur">Currency</label>
                <input
                  id="rcur"
                  className="field"
                  value={menu.currency}
                  onChange={(e) => setMenu({ ...menu, currency: e.target.value })}
                />
              </div>
            </div>

            {menu.sections.map((section, si) => (
              <div className="sectionblock" key={si}>
                <div className="sectionblock__head">
                  <input
                    className="field"
                    value={section.name}
                    aria-label={`Section ${si + 1} name`}
                    onChange={(e) => edit(si, null, "name", e.target.value)}
                  />
                </div>
                {section.items.map((item, ii) => (
                  <div className="row" key={ii}>
                    <input
                      className="field"
                      value={item.name}
                      aria-label="Dish name"
                      onChange={(e) => edit(si, ii, "name", e.target.value)}
                    />
                    <input
                      className="field"
                      value={item.description}
                      placeholder="Description (optional)"
                      aria-label="Description"
                      onChange={(e) => edit(si, ii, "description", e.target.value)}
                    />
                    <input
                      className="field num row__price"
                      type="number"
                      step="0.01"
                      value={item.price ?? ""}
                      placeholder={symbol}
                      aria-label="Price"
                      onChange={(e) =>
                        edit(si, ii, "price", e.target.value === "" ? null : parseFloat(e.target.value))
                      }
                    />
                    <select
                      className="field"
                      value={item.is_vegetarian === null ? "" : item.is_vegetarian ? "1" : "0"}
                      aria-label="Vegetarian"
                      onChange={(e) =>
                        edit(si, ii, "is_vegetarian", e.target.value === "" ? null : e.target.value === "1")
                      }
                    >
                      <option value="">Not marked</option>
                      <option value="1">Veg</option>
                      <option value="0">Non-veg</option>
                    </select>
                    <button
                      className="iconbtn"
                      onClick={() => removeItem(si, ii)}
                      aria-label={`Remove ${item.name}`}
                      title="Remove dish"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ))}

            <div className="publishbar">
              <label className="check">
                <input
                  type="checkbox"
                  checked={withImages}
                  onChange={(e) => setWithImages(e.target.checked)}
                />
                Add dish photos
              </label>
              {withImages && (
                <label className="check">
                  limit to
                  <input
                    className="field num stepper"
                    type="number"
                    min={0}
                    value={maxImages}
                    onChange={(e) => setMaxImages(parseInt(e.target.value || "0", 10))}
                  />
                  (0 = all)
                </label>
              )}
              <button
                className="btn btn--primary"
                style={{ marginInlineStart: "auto" }}
                disabled={saving}
                onClick={saveAndPublish}
              >
                {saving ? "Saving…" : "Publish menu"}
              </button>
            </div>
            {error && <p className="errorbox" style={{ marginBlockStart: "0.9rem" }}>{error}</p>}
          </section>
        )}

        {/* ------------------------------------------------------- published */}
        {stage === "edit" && editingId && (
          <EditRestaurant
            restaurantId={editingId}
            onDone={() => {
              setEditingId(null);
              setStage("list");
              refresh();
            }}
          />
        )}

        {stage === "publish" && job && (
          <section className="panel" style={{ marginBlock: "2rem 4rem" }}>
            <div className="panel__head">
              <h2 className="panel__title">
                {job.status === "done" ? "Your menu is live" : "Publishing"}
              </h2>
              {published && <span className="panel__note">{published.slug}</span>}
            </div>

            {job.status === "running" && (
              <>
                <div className="progress__meta">
                  <span>{job.step}</span>
                  {job.total > 0 && (
                    <span className="num">{job.done} of {job.total} photos</span>
                  )}
                </div>
                <div className="progress">
                  <div
                    className="progress__bar"
                    style={{ inlineSize: job.total ? `${Math.round((100 * job.done) / job.total)}%` : "12%" }}
                  />
                </div>
              </>
            )}

            {job.status === "error" && <p className="errorbox">{job.error}</p>}

            {job.status === "done" && published && (
              <div className="result">
                <div>
                  <div className="logopanel">
                    <LogoUpload
                      restaurantId={published.id}
                      initial={published.logo_url}
                      onChange={(url) => {
                        setPublished({ ...published, logo_url: url });
                        refresh();
                      }}
                    />
                  </div>
                  <iframe
                    className="previewframe"
                    src={`/r/${published.slug}`}
                    title="Your published menu"
                  />
                  <div className="linkrow">
                    <a href={`/r/${published.slug}`} target="_blank" rel="noreferrer">
                      Open your menu ↗
                    </a>
                    <button className="linkbtn" onClick={() => setStage("list")}>
                      Back to your menus
                    </button>
                  </div>
                </div>
                <div className="qrcard">
                  {qrUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrUrl} alt="QR code for your menu" />
                  ) : (
                    <div className="qrcard__placeholder">preparing QR…</div>
                  )}
                  <p className="status">Print this for your tables</p>
                  <button
                    className="btn btn--quiet btn--sm"
                    onClick={async () => {
                      const url = await fetchQrObjectUrl(published.id, true);
                      window.open(url, "_blank");
                    }}
                  >
                    Printable table card
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
