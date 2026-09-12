"use client";

import { useRef, useState } from "react";
import { removeLogo, uploadLogo } from "@/lib/api";

/** Logo picker for a saved restaurant. Shows what the diner will see, so the
 *  owner can judge it before anyone else does. */
export default function LogoUpload({
  restaurantId,
  initial,
  onChange,
  compact = false,
}: {
  restaurantId: string;
  initial: string | null;
  onChange?: (url: string | null) => void;
  /** Thumbnail only, for a list of restaurants. The full version explains what
   *  a logo is and where it appears — useful once, but repeated down a list it
   *  becomes the loudest thing on every card. Removing a logo stays in Edit,
   *  where the rest of the restaurant's settings live. */
  compact?: boolean;
}) {
  const [logo, setLogo] = useState<string | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function pick(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { logo_url } = await uploadLogo(restaurantId, file);
      setLogo(logo_url);
      onChange?.(logo_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That upload didn't work.");
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    setError(null);
    try {
      await removeLogo(restaurantId);
      setLogo(null);
      onChange?.(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not remove the logo.");
    } finally {
      setBusy(false);
    }
  }

  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
      hidden
      onChange={(e) => {
        pick(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (compact) {
    return (
      <>
        <button
          className="logopick"
          disabled={busy}
          onClick={() => input.current?.click()}
          title={logo ? "Replace this logo" : "Add a logo"}
        >
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="" />
          ) : (
            <span className="logopick__empty">Logo</span>
          )}
          <span className="logopick__hint">{busy ? "…" : logo ? "Change" : "Add"}</span>
        </button>
        {picker}
        {error && <p className="status status--error">{error}</p>}
      </>
    );
  }

  return (
    <div className="logorow">
      <div className="logorow__preview">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="Your logo" />
        ) : (
          <span className="logorow__empty">No logo</span>
        )}
      </div>

      <div className="logorow__body">
        <p className="label" style={{ marginBlockEnd: "0.15rem" }}>
          Restaurant logo
        </p>
        <p className="status">
          Shown at the top of your menu. PNG, JPG or WEBP, up to 5 MB.
        </p>

        <div className="logorow__actions">
          <button
            className="btn btn--quiet btn--sm"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            {busy ? "Uploading…" : logo ? "Replace" : "Add logo"}
          </button>
          {logo && !busy && (
            <button className="linkbtn linkbtn--danger" onClick={clear}>
              Remove
            </button>
          )}
          {picker}
        </div>

        {error && (
          <p className="status status--error" style={{ marginBlockStart: "0.4rem" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
