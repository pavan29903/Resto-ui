"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

/** Sign-in / sign-up. Deliberately one screen with one toggle: a cafe owner
 *  should not have to work out which form they need. */
export default function SignIn() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const client = supabase();
      if (mode === "up") {
        const { data, error } = await client.auth.signUp({ email, password });
        if (error) throw error;
        // With email confirmation on, there's no session until they confirm.
        if (!data.session) setSent(true);
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't work.");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="panel authcard">
        <h2 className="panel__title">Check your email</h2>
        <p className="status" style={{ marginBlockStart: "0.6rem" }}>
          We sent a confirmation link to <strong>{email}</strong>. Open it, then
          come back and sign in.
        </p>
      </div>
    );
  }

  return (
    <form className="panel authcard" onSubmit={submit}>
      <h2 className="panel__title">
        {mode === "in" ? "Sign in" : "Create your account"}
      </h2>
      <p className="status" style={{ marginBlock: "0.4rem 1.1rem" }}>
        {mode === "in"
          ? "Your menus and QR codes live here."
          : "One account covers every restaurant you run."}
      </p>

      <label className="label" htmlFor="email">Email</label>
      <input
        id="email"
        className="field"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="label" htmlFor="password" style={{ marginBlockStart: "0.85rem" }}>
        Password
      </label>
      <input
        id="password"
        className="field"
        type="password"
        autoComplete={mode === "in" ? "current-password" : "new-password"}
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {mode === "up" && (
        <p className="status" style={{ marginBlockStart: "0.35rem" }}>
          At least 8 characters.
        </p>
      )}

      {error && (
        <p className="errorbox" style={{ marginBlockStart: "0.9rem" }}>{error}</p>
      )}

      <button
        className="btn btn--primary"
        style={{ inlineSize: "100%", marginBlockStart: "1.1rem" }}
        disabled={busy}
      >
        {busy ? "One moment…" : mode === "in" ? "Sign in" : "Create account"}
      </button>

      <p className="status" style={{ marginBlockStart: "1rem", textAlign: "center" }}>
        {mode === "in" ? "New here? " : "Already have an account? "}
        <button
          type="button"
          className="linkbtn"
          onClick={() => {
            setMode(mode === "in" ? "up" : "in");
            setError(null);
          }}
        >
          {mode === "in" ? "Create an account" : "Sign in"}
        </button>
      </p>
    </form>
  );
}
