"use client";

import { useEffect, useState } from "react";
import LogoUpload from "@/components/LogoUpload";
import MenuEditor from "@/components/MenuEditor";
import {
  checkSlug,
  getRestaurant,
  startPublish,
  updateRestaurant,
} from "@/lib/api";
import {
  countItems,
  type DishPhoto,
  type Menu,
  type RestaurantSummary,
} from "@/lib/types";

/** Editing a menu that's already live.
 *
 *  A cafe changes its prices far more often than it opens, so this is the
 *  screen an owner will actually use week to week — fixing a typo must not
 *  mean deleting the menu and starting again.
 */
export default function EditRestaurant({
  restaurantId,
  onDone,
}: {
  restaurantId: string;
  onDone: () => void;
}) {
  const [restaurant, setRestaurant] = useState<RestaurantSummary | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [photos, setPhotos] = useState<Record<string, DishPhoto>>({});

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [slugState, setSlugState] = useState<"idle" | "checking" | "free" | "taken" | "bad">("idle");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filling, setFilling] = useState(false);

  useEffect(() => {
    getRestaurant(restaurantId)
      .then(({ restaurant, menu, photos }) => {
        setRestaurant(restaurant);
        setMenu(menu);
        setPhotos(photos || {});
        setName(restaurant.name);
        setSlug(restaurant.slug);
        setOriginalSlug(restaurant.slug);
        setWhatsapp(restaurant.whatsapp || "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load."));
  }, [restaurantId]);

  // Check the address as they type, but only once they've stopped.
  useEffect(() => {
    if (!slug || slug === originalSlug) {
      setSlugState("idle");
      return;
    }
    setSlugState("checking");
    const t = setTimeout(async () => {
      try {
        const { available, reason } = await checkSlug(slug);
        setSlugState(available ? "free" : reason === "not_allowed" ? "bad" : "taken");
      } catch {
        setSlugState("idle");
      }
    }, 450);
    return () => clearTimeout(t);
  }, [slug, originalSlug]);

  async function save() {
    if (!menu) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateRestaurant(restaurantId, {
        name,
        menu,
        whatsapp,
        slug: slug !== originalSlug ? slug : undefined,
      });
      setRestaurant(updated);
      setOriginalSlug(updated.slug);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  }

  /** Find photos for dishes added since the last publish. */
  async function fillMissingPhotos() {
    setFilling(true);
    setError(null);
    try {
      await startPublish(restaurantId, { generate_images: true, max_images: 0 });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start that.");
    } finally {
      setFilling(false);
    }
  }

  if (error && !restaurant) return <p className="errorbox">{error}</p>;
  if (!restaurant || !menu) return <p className="status">Loading your menu…</p>;

  const slugChanged = slug !== originalSlug;

  return (
    <section className="panel" style={{ marginBlock: "2rem 4rem" }}>
      <div className="panel__head">
        <h2 className="panel__title">Edit {restaurant.name}</h2>
        <span className="panel__note">
          {menu.sections.length} sections · {countItems(menu)} dishes
        </span>
      </div>

      <div className="logopanel">
        <LogoUpload restaurantId={restaurantId} initial={restaurant.logo_url} />
      </div>

      <div className="metagrid">
        <div>
          <label className="label" htmlFor="ename">Restaurant name</label>
          <input
            id="ename"
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="ecur">Currency</label>
          <input
            id="ecur"
            className="field"
            value={menu.currency}
            onChange={(e) => setMenu({ ...menu, currency: e.target.value })}
          />
        </div>
      </div>

      <div className="metagrid">
        <div>
          <label className="label" htmlFor="eslug">Web address</label>
          <input
            id="eslug"
            className="field"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
          />
          <p className="status" style={{ marginBlockStart: "0.3rem" }}>
            {slugState === "checking" && "Checking…"}
            {slugState === "free" && "✓ Available"}
            {slugState === "taken" && "Already taken — try another."}
            {slugState === "bad" && "Not allowed. Use letters, numbers and hyphens."}
            {slugState === "idle" && restaurant.menu_url.replace(/^https?:\/\//, "")}
          </p>
          {slugChanged && (
            <p className="warnbox">
              Changing this changes your menu&apos;s address — any QR codes you
              have already printed will stop working.
            </p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="ewa">WhatsApp number</label>
          <input
            id="ewa"
            className="field"
            value={whatsapp}
            placeholder="919876543210"
            onChange={(e) => setWhatsapp(e.target.value)}
          />
          <p className="status" style={{ marginBlockStart: "0.3rem" }}>
            Adds an &ldquo;Order on WhatsApp&rdquo; button to your menu. Include
            the country code.
          </p>
        </div>
      </div>

      <MenuEditor
        menu={menu}
        onChange={setMenu}
        restaurantId={restaurantId}
        photos={photos}
        onPhotoChange={(key, photo) =>
          setPhotos((prev) => ({ ...prev, [key]: photo }))
        }
      />

      <div className="publishbar">
        <button
          className="btn btn--quiet"
          disabled={filling}
          onClick={fillMissingPhotos}
          title="Finds photos for dishes that don't have one yet"
        >
          {filling ? "Finding photos…" : "Find photos for new dishes"}
        </button>
        <button className="linkbtn" onClick={onDone}>
          Back to your menus
        </button>
        <button
          className="btn btn--primary"
          style={{ marginInlineStart: "auto" }}
          disabled={saving || slugState === "taken" || slugState === "bad"}
          onClick={save}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {saved && !error && (
        <p className="status" style={{ marginBlockStart: "0.7rem" }}>
          Saved. Your menu is updated.
        </p>
      )}
      {error && <p className="errorbox" style={{ marginBlockStart: "0.7rem" }}>{error}</p>}
    </section>
  );
}
