"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

/**
 * Light / dark control for the diner menu.
 *
 * A menu gets read in daylight on a terrace and in a dim dining room at 9pm,
 * so following the phone's setting is the right default — but a diner who
 * wants the other one shouldn't have to leave the page to get it.
 *
 * The choice is stamped on <html> as data-theme, which the token layer in
 * globals.css already responds to.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("menusnap-theme") as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("menusnap-theme");
    } else {
      root.setAttribute("data-theme", next);
      localStorage.setItem("menusnap-theme", next);
    }
  }

  // Tapping cycles light -> dark -> follow phone, so one control covers all
  // three states without a menu.
  const next: Theme =
    theme === "system" ? "light" : theme === "light" ? "dark" : "system";
  const label =
    theme === "system"
      ? "Theme: following your phone"
      : theme === "light"
        ? "Theme: light"
        : "Theme: dark";

  return (
    <button
      type="button"
      className="themetoggle"
      onClick={() => apply(next)}
      aria-label={`${label}. Tap to change.`}
      title={label}
    >
      <span className="themetoggle__icon" aria-hidden="true">
        {theme === "system" ? "◐" : theme === "light" ? "☀" : "☾"}
      </span>
    </button>
  );
}
