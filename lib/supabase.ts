"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser-side Supabase client. Handles signup, login and session refresh;
 *  the backend never sees a password, only the JWT this issues. */
export function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase isn't configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local",
    );
  }
  return createBrowserClient(url, key);
}
