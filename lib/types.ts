/** Mirrors app/schemas/menu.py and the router response models in resto-api. */

export type MenuItem = {
  name: string;
  description: string;
  price: number | null;
  is_vegetarian: boolean | null;
  spice_level: string | null;
};

export type MenuSection = {
  name: string;
  items: MenuItem[];
};

export type Menu = {
  restaurant_name: string | null;
  currency: string;
  sections: MenuSection[];
};

export type RestaurantSummary = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  is_published: boolean;
  menu_url: string;
  item_count: number;
  logo_url: string | null;
  whatsapp: string | null;
};

/** What the diner page receives. `images` is keyed "<section>-<item>". */
export type PublicMenu = {
  slug: string;
  name: string;
  logo_url: string | null;
  whatsapp: string | null;
  menu: Menu;
  images: Record<string, string>;
};

export type ExtractResponse = {
  menu: Menu;
  item_count: number;
};

export type PublishJob = {
  job_id: string;
  status: "running" | "done" | "error";
  step: string;
  done: number;
  total: number;
  error: string | null;
  menu_url: string | null;
  slug?: string;
};

export type ApiConfig = {
  extraction_provider: string;
  extraction_model: string;
  image_provider: string;
  image_fallback: string;
  menu_domain: string | null;
  has_extraction_key: boolean;
  has_image_key: boolean;
};

const SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  EUR: "€",
  GBP: "£",
  AED: "د.إ",
};

export function symbolFor(currency: string | undefined): string {
  return SYMBOLS[(currency || "INR").toUpperCase()] ?? "₹";
}

export function formatPrice(price: number | null, currency: string): string {
  if (price === null || price === undefined) return "";
  const symbol = symbolFor(currency);
  return Number.isInteger(price) ? `${symbol}${price}` : `${symbol}${price.toFixed(2)}`;
}

export function countItems(menu: Menu): number {
  return menu.sections.reduce((total, s) => total + s.items.length, 0);
}

/** One dish's photo, keyed "<section>-<item>" in the owner API. */
export type DishPhoto = {
  item_id: string;
  url: string | null;
  source: string | null;
};
