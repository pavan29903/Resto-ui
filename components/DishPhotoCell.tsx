"use client";

import { useRef, useState } from "react";
import { deleteDishPhoto, researchDishPhoto, uploadDishPhoto } from "@/lib/api";
import type { DishPhoto } from "@/lib/types";

/** The photo control for one dish, inside the menu editor.
 *
 *  Automatic matching gets most dishes right and some badly wrong — a search
 *  for a regional dish can land on something generic. This is the owner's
 *  correction: swap in their own photo, or ask for a different match.
 *
 *  Changes save immediately rather than waiting for "Save changes", because a
 *  photo is a file, not a form field.
 */
export default function DishPhotoCell({
  restaurantId,
  photo,
  dishName,
  onChange,
}: {
  restaurantId: string;
  photo: DishPhoto | undefined;
  dishName: string;
  onChange: (next: DishPhoto) => void;
}) {
  const [busy, setBusy] = useState<null | "upload" | "search" | "remove">(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // No id means the dish hasn't been saved yet — nothing to attach a photo to.
  if (!photo?.item_id) {
    return (
      <div className="photocell photocell--new" title="Save this dish first, then add a photo">
        <span className="photocell__hint">new</span>
      </div>
    );
  }

  async function run(kind: "upload" | "search" | "remove", file?: File) {
    setBusy(kind);
    setError(null);
    try {
      if (kind === "upload" && file) {
        onChange(await uploadDishPhoto(restaurantId, photo!.item_id, file));
      } else if (kind === "search") {
        onChange(await researchDishPhoto(restaurantId, photo!.item_id));
      } else if (kind === "remove") {
        await deleteDishPhoto(restaurantId, photo!.item_id);
        onChange({ item_id: photo!.item_id, url: null, source: null });
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="photocell">
      <button
        type="button"
        className="photocell__btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Photo for ${dishName || "this dish"}`}
        aria-expanded={open}
      >
        {photo.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="" />
        ) : (
          <span className="photocell__hint">add</span>
        )}
        {busy && <span className="photocell__busy" aria-hidden="true" />}
      </button>

      {photo.source === "owner" && <span className="photocell__own" title="Your own photo">•</span>}

      {open && (
        <div className="photomenu" role="menu">
          <button
            className="photomenu__item"
            disabled={busy !== null}
            onClick={() => input.current?.click()}
          >
            {busy === "upload" ? "Uploading…" : "Use my own photo"}
          </button>
          <button
            className="photomenu__item"
            disabled={busy !== null}
            onClick={() => run("search")}
          >
            {busy === "search" ? "Looking…" : "Find a different photo"}
          </button>
          {photo.url && (
            <button
              className="photomenu__item photomenu__item--danger"
              disabled={busy !== null}
              onClick={() => run("remove")}
            >
              {busy === "remove" ? "Removing…" : "Remove photo"}
            </button>
          )}
          {error && <p className="photomenu__error">{error}</p>}
          <input
            ref={input}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) run("upload", f);
            }}
          />
        </div>
      )}
    </div>
  );
}
