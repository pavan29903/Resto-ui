"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminExpiring,
  adminHandover,
  adminMarkPaid,
  type ExpiringOwner,
} from "@/lib/api";
import "../dashboard/console.css";
import "./admin.css";

/** Where you collect money and renew people.
 *
 *  Not part of the product — this is the back office, and it looks like one.
 *  No Supabase account is involved: it is gated by the same ADMIN_TOKEN the
 *  API checks, typed in once and kept in this browser's localStorage. That
 *  keeps the secret out of the deployed bundle, where anyone could read it.
 *
 *  Renewal is deliberately manual. Someone pays you by UPI, you see it in your
 *  banking app, you press a button here. Building a payment integration to
 *  automate a task that takes ten seconds a week would be the wrong order to
 *  do things in.
 */
const STORAGE_KEY = "restofood.admin.token";

export default function Admin() {
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);
  const [owners, setOwners] = useState<ExpiringOwner[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [handSlug, setHandSlug] = useState("");
  const [handEmail, setHandEmail] = useState("");
  const [handPhone, setHandPhone] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setToken(stored);
      setSaved(true);
    }
  }, []);

  const load = useCallback(
    async (withToken: string, withinDays: number) => {
      if (!withToken) return;
      setLoading(true);
      setError(null);
      try {
        const data = await adminExpiring(withToken, withinDays);
        setOwners(data.owners);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "That didn't work. Check the token.",
        );
        setOwners([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (saved && token) load(token, days);
  }, [saved, token, days, load]);

  async function pay(email: string, months: number) {
    setNote(null);
    setError(null);
    try {
      const result = await adminMarkPaid(token, email, months);
      const until = result.expires_on
        ? new Date(result.expires_on).toLocaleDateString()
        : "—";
      setNote(`${email} is paid until ${until}.`);
      await load(token, days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record that payment.");
    }
  }

  async function handover() {
    setNote(null);
    setError(null);
    try {
      const result = await adminHandover(token, handSlug, handEmail, handPhone);
      setNote(
        `${result.slug}.restofood.in now belongs to ${result.now_owned_by}` +
          (result.awaiting_signup
            ? " — waiting for them to sign up with that email."
            : " — they can see it next time they sign in."),
      );
      setHandSlug("");
      setHandEmail("");
      setHandPhone("");
      await load(token, days);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not hand that over.");
    }
  }

  if (!saved) {
    return (
      <main className="shell centered">
        <div className="authwrap">
          <h1 className="wordmark" style={{ marginBlockEnd: "0.4rem" }}>
            RestoFood admin
          </h1>
          <p className="status" style={{ marginBlockEnd: "1rem" }}>
            Paste the ADMIN_TOKEN you set on the API. It stays in this browser.
          </p>
          <input
            className="field"
            type="password"
            value={token}
            placeholder="ADMIN_TOKEN"
            onChange={(e) => setToken(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && token) {
                localStorage.setItem(STORAGE_KEY, token);
                setSaved(true);
              }
            }}
          />
          <button
            className="btn btn--primary"
            style={{ marginBlockStart: "0.8rem" }}
            disabled={!token}
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, token);
              setSaved(true);
            }}
          >
            Open
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="console">
      <header className="topbar">
        <div className="shell topbar__inner">
          <span className="wordmark">RestoFood admin</span>
          <div className="topbar__right">
            <button
              className="btn btn--quiet btn--sm"
              onClick={() => load(token, days)}
              disabled={loading}
            >
              {loading ? "Checking…" : "Refresh"}
            </button>
            <button
              className="btn btn--quiet btn--sm"
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setToken("");
                setSaved(false);
              }}
            >
              Forget token
            </button>
          </div>
        </div>
      </header>

      <div className="shell">
        <section className="intro">
          <p className="eyebrow">Back office</p>
          <h1 className="intro__title">Who needs chasing</h1>
          <p className="intro__lede">
            Trials ending soon, plus anyone already lapsed. Message them, take
            the money, then record it here.
          </p>
        </section>

        <div className="adminbar">
          <label className="label" htmlFor="within">
            Show the next
          </label>
          <select
            id="within"
            className="field"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value, 10))}
          >
            <option value={3}>3 days</option>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>

        {error && <p className="errorbox">{error}</p>}
        {note && <p className="okbox">{note}</p>}

        {loading ? (
          <p className="status">Checking…</p>
        ) : owners.length === 0 ? (
          <p className="status">
            Nobody due in the next {days} days. Nothing to do.
          </p>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Restaurant owner</th>
                <th>Status</th>
                <th>Expires</th>
                <th>Record a payment</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((o) => (
                <tr key={o.email}>
                  <td>
                    <span className="who">
                      {/* With a number this opens a chat with them directly;
                          without one WhatsApp just opens and you pick the
                          contact, which is why capturing it at handover is
                          worth the extra field. */}
                      <a
                        className="linkbtn"
                        href={
                          `https://wa.me/${o.phone ?? ""}?text=` +
                          encodeURIComponent(
                            "Hi — your RestoFood plan is due. ₹1,999 for six months, or ₹2,999 for the year.",
                          )
                        }
                        target="_blank"
                        rel="noreferrer"
                        title={
                          o.phone
                            ? `Message ${o.phone} on WhatsApp`
                            : "No number saved — WhatsApp will ask who to send to"
                        }
                      >
                        {o.email}
                      </a>
                      {!o.phone && (
                        <span className="who__missing" title="No phone number saved">
                          no number
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className={`astate astate--${o.status}`}>{o.status}</span>
                  </td>
                  <td className="num">
                    {o.days_left >= 0
                      ? `in ${o.days_left} d`
                      : `${Math.abs(o.days_left)} d ago`}
                  </td>
                  <td className="arow">
                    <button className="btn btn--quiet btn--sm" onClick={() => pay(o.email, 6)}>
                      ₹1,999 · 6 months
                    </button>
                    <button className="btn btn--primary btn--sm" onClick={() => pay(o.email, 12)}>
                      ₹2,999 · 1 year
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* The end of a sales visit: you built their menu on your own
            account to show them, they said yes, now it becomes theirs. */}
        <section className="manual">
          <p className="label">Hand a restaurant over to its owner</p>
          <p className="status" style={{ marginBlockEnd: "0.7rem" }}>
            Keeps the menu, the web address and the printed QR code. They
            don&apos;t need an account yet — it&apos;ll be waiting when they
            sign up with this email.
          </p>

          <div className="handrow">
            <label className="label" htmlFor="h-slug">
              Their web address
            </label>
            <div className="addr">
              <input
                id="h-slug"
                className="field"
                value={handSlug}
                placeholder="spicegarden"
                onChange={(e) => setHandSlug(e.target.value.trim().toLowerCase())}
              />
              <span className="addr__suffix">.restofood.in</span>
            </div>
          </div>

          <div className="handrow">
            <label className="label" htmlFor="h-email">
              Their email — this is the account they&apos;ll sign in with
            </label>
            <input
              id="h-email"
              className="field"
              type="email"
              value={handEmail}
              placeholder="owner@cafe.com"
              onChange={(e) => setHandEmail(e.target.value.trim())}
            />
          </div>

          <div className="handrow">
            <label className="label" htmlFor="h-phone">
              Their WhatsApp number — so renewal reminders are one tap
            </label>
            <input
              id="h-phone"
              className="field"
              type="tel"
              inputMode="tel"
              value={handPhone}
              placeholder="8466901383"
              onChange={(e) => setHandPhone(e.target.value)}
            />
          </div>

          <button
            className="btn btn--primary"
            style={{ marginBlockStart: "0.8rem" }}
            disabled={!handSlug || !handEmail}
            onClick={handover}
          >
            Hand over
          </button>
        </section>

        {/* Someone who paid early won't be in the list above. */}
        <section className="manual">
          <p className="label">Record a payment for anyone else</p>
          <div className="arow">
            <input
              className="field"
              type="email"
              value={manual}
              placeholder="their@email.com"
              onChange={(e) => setManual(e.target.value)}
            />
            <button
              className="btn btn--quiet btn--sm"
              disabled={!manual}
              onClick={() => pay(manual, 6)}
            >
              6 months
            </button>
            <button
              className="btn btn--primary btn--sm"
              disabled={!manual}
              onClick={() => pay(manual, 12)}
            >
              1 year
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
