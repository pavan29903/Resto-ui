"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ThemeToggle from "@/components/ThemeToggle";
import "../dashboard/console.css";

/** Where the emailed "set a new password" link lands.
 *
 *  Supabase turns the recovery link into a real session before handing control
 *  back, so by the time this page runs the visitor is already authenticated —
 *  just with a password they can't remember. All that's left is to set one.
 *
 *  The session arrives asynchronously through onAuthStateChange, so this
 *  waits for it rather than reading it once on mount. Checking too early is
 *  the classic way this page tells a valid visitor their link has expired.
 */
export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const client = supabase();

    const { data: sub } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setValid(true);
        setReady(true);
      }
    });

    // Already signed in — someone opened /reset directly, which is a perfectly
    // reasonable way to change a password you do remember.
    client.auth.getSession().then(({ data }) => {
      if (data.session) setValid(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase().auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main className="shell centered">
        <p className="status">One moment…</p>
      </main>
    );
  }

  if (done) {
    return (
      <main className="shell centered">
        <div className="authwrap">
          <div className="panel authcard">
            <h2 className="panel__title">Password changed</h2>
            <p className="status" style={{ marginBlock: "0.6rem 1.1rem" }}>
              You&apos;re signed in. Your menus are where you left them.
            </p>
            <a
              className="btn btn--primary"
              href="/dashboard"
              style={{ textDecoration: "none" }}
            >
              Go to your menus
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (!valid) {
    return (
      <main className="shell centered">
        <div className="authwrap">
          <div className="panel authcard">
            <h2 className="panel__title">That link has expired</h2>
            <p className="status" style={{ marginBlock: "0.6rem 1.1rem" }}>
              Reset links last an hour, and each one works once. Ask for
              another and it&apos;ll be in your inbox in a minute.
            </p>
            <a
              className="btn btn--primary"
              href="/dashboard"
              style={{ textDecoration: "none" }}
            >
              Ask for a new link
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="shell centered">
      <div className="authwrap">
        <div className="authwrap__head">
          <p className="wordmark">RestoFood</p>
          <ThemeToggle />
        </div>

        <form className="panel authcard" onSubmit={submit}>
          <h2 className="panel__title">Choose a new password</h2>
          <p className="status" style={{ marginBlock: "0.4rem 1.1rem" }}>
            Your menu stayed live the whole time — only your way in changed.
          </p>

          <label className="label" htmlFor="pw">New password</label>
          <input
            id="pw"
            className="field"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <p className="status" style={{ marginBlockStart: "0.35rem" }}>
            At least 8 characters.
          </p>

          <label className="label" htmlFor="pw2" style={{ marginBlockStart: "0.85rem" }}>
            Type it again
          </label>
          <input
            id="pw2"
            className="field"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          {error && (
            <p className="errorbox" style={{ marginBlockStart: "0.9rem" }}>{error}</p>
          )}

          <button
            className="btn btn--primary"
            style={{ inlineSize: "100%", marginBlockStart: "1.1rem" }}
            disabled={busy}
          >
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>
    </main>
  );
}
