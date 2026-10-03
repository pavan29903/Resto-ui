"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Mode = "in" | "up" | "forgot";

/** Sign-in / sign-up / password reset. Deliberately one screen: a cafe owner
 *  should not have to work out which form they need.
 *
 *  The reset path matters more than it looks. "I've forgotten my password" is
 *  the most common support request any product gets, and without it every one
 *  of them arrives on the founder's phone and has to be fixed by hand in the
 *  Supabase dashboard.
 */
export default function SignIn() {
  const [mode, setMode] = useState<Mode>("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<"signup" | "reset" | null>(null);

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
        if (!data.session) setSent("signup");
      } else if (mode === "forgot") {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          // Where Supabase sends them after they click the emailed link. Must
          // also be listed in the project's Redirect URLs, or it silently
          // falls back to the Site URL and lands them on the landing page
          // with no idea what went wrong.
          redirectTo: `${window.location.origin}/reset`,
        });
        if (error) throw error;
        setSent("reset");
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
          {sent === "signup" ? (
            <>
              We sent a confirmation link to <strong>{email}</strong>. Open it,
              then come back and sign in.
            </>
          ) : (
            <>
              If <strong>{email}</strong> has an account, there&apos;s a link on
              its way to set a new password. It expires in an hour.
            </>
          )}
        </p>
        {sent === "reset" && (
          <p className="status" style={{ marginBlockStart: "0.8rem" }}>
            Nothing arrived? Check spam, or{" "}
            <button
              type="button"
              className="linkbtn"
              onClick={() => {
                setSent(null);
                setMode("forgot");
              }}
            >
              try another address
            </button>
            .
          </p>
        )}
      </div>
    );
  }

  return (
    <form className="panel authcard" onSubmit={submit}>
      <h2 className="panel__title">
        {mode === "in"
          ? "Sign in"
          : mode === "up"
            ? "Create your account"
            : "Reset your password"}
      </h2>
      <p className="status" style={{ marginBlock: "0.4rem 1.1rem" }}>
        {mode === "in"
          ? "Your menus and QR codes live here."
          : mode === "up"
            ? "One account covers every restaurant you run."
            : "Tell us your email and we'll send a link to set a new one. Your menu stays live throughout."}
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

      {mode !== "forgot" && (
        <>
          <div className="pwhead">
            <label className="label" htmlFor="password">Password</label>
            {mode === "in" && (
              <button
                type="button"
                className="linkbtn"
                onClick={() => {
                  setMode("forgot");
                  setError(null);
                }}
              >
                Forgot password?
              </button>
            )}
          </div>
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
        </>
      )}

      {error && (
        <p className="errorbox" style={{ marginBlockStart: "0.9rem" }}>{error}</p>
      )}

      <button
        className="btn btn--primary"
        style={{ inlineSize: "100%", marginBlockStart: "1.1rem" }}
        disabled={busy}
      >
        {busy
          ? "One moment…"
          : mode === "in"
            ? "Sign in"
            : mode === "up"
              ? "Create account"
              : "Send me a link"}
      </button>

      <p className="status" style={{ marginBlockStart: "1rem", textAlign: "center" }}>
        {mode === "forgot" ? (
          <button
            type="button"
            className="linkbtn"
            onClick={() => {
              setMode("in");
              setError(null);
            }}
          >
            Back to sign in
          </button>
        ) : (
          <>
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
          </>
        )}
      </p>
    </form>
  );
}
