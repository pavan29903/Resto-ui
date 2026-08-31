import type { Metadata } from "next";
import { Rozha_One, Mukta } from "next/font/google";
import "./globals.css";

/* Rozha One — the one characterful face, used once per page.
   Mukta — the workhorse. Both chosen because they carry Devanagari as well as
   Latin: real Indian menus are bilingual, and a face that renders tofu boxes
   for half the menu is not a candidate however handsome it looks in English. */
const display = Rozha_One({
  weight: "400",
  subsets: ["latin", "devanagari"],
  variable: "--font-display",
  display: "swap",
});

const body = Mukta({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "devanagari"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RestoFood",
  description:
    "Turn a paper menu card into a menu people can order from — photo in, QR out.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  // Diners squint at small type in dim rooms; let them zoom.
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1116" },
  ],
};

/* Runs before first paint. Without it, a diner who chose dark would get a
   flash of the light theme on every page load — worst exactly where it's
   most noticeable, in a dark restaurant. */
const NO_FLASH = `
try {
  var t = localStorage.getItem('restofood-theme');
  if (t === 'light' || t === 'dark') {
    document.documentElement.setAttribute('data-theme', t);
  }
} catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning is required, not lazy: the script below stamps
    // data-theme onto <html> before React hydrates, so the server's markup
    // (which has no such attribute) will never match the client's. This is the
    // documented escape hatch for exactly that, and it only suppresses the
    // warning for attributes on this one element.
    <html
      lang="en"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
