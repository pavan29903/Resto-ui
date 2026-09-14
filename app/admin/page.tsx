"use client";

import { useCallback, useEffect, useState } from "react";
import {
  adminExpiring,
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
                    <a
                      className="linkbtn"
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `Hi — your RestoFood plan is due. ₹1,999 for six months or ₹2,999 for the year.`,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open WhatsApp with a message ready"
                    >
                      {o.email}
                    </a>
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
