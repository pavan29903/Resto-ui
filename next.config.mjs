/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dish photos now come straight from Supabase Storage (a public CDN URL),
  // so there's nothing left to proxy — the old /menus rewrite is gone.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
