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
    const stored = localStorage.getItem("restofood-theme") as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function apply(next: Theme) {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      root.removeAttribute("data-theme");
      localStorage.removeItem("restofood-theme");
    } else {
      root.setAttribute("data-theme", next);
      localStorage.setItem("restofood-theme", next);
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
      <Icon theme={theme} />
    </button>
  );
}

/** Drawn rather than typed. The glyphs this used before (☀ ☾ ◐) come from
 *  whatever font happens to have them, so they arrived at different weights
 *  and sizes on every platform and looked like something had failed to load.
 *  These are one consistent 18px grid, inheriting the button's colour. */
function Icon({ theme }: { theme: Theme }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (theme === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
      </svg>
    );
  }

  if (theme === "dark") {
    return (
      <svg {...common}>
        <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" />
      </svg>
    );
  }

  // Following the device: half lit, half not.
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
