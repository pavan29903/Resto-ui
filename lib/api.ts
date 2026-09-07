import { supabase } from "./supabase";
import type {
  ApiConfig,
  ExtractResponse,
  Menu,
  PublicMenu,
  PublishJob,
  RestaurantSummary,
  DishPhoto,
} from "./types";

export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100";

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in to continue.");
  return { Authorization: `Bearer ${token}` };
}

async function unwrap<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Something went wrong (${res.status}).`;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      /* non-JSON body — keep the generic message */
    }
    throw new Error(detail);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/* ------------------------------------------------------------------ public */

export async function getConfig(): Promise<ApiConfig> {
  return unwrap(await fetch(`${API}/api/config`, { cache: "no-store" }));
}

/** The menu a diner sees. No auth — this is the point of the QR code.
 *
 *  Cached at the edge for a minute rather than fetched per request. A menu
 *  changes a few times a month, but it's read every time someone sits down,
 *  so almost every scan can be served without touching the API at all. That
 *  makes the menu load fast, and it means a sleeping backend (Render's free
 *  tier spins down when idle) isn't in the diner's path.
 *
 *  The cost is that an owner's edit can take up to a minute to appear.
 */
export async function getPublicMenu(slug: string): Promise<PublicMenu | null> {
  try {
    const res = await fetch(`${API}/api/public/menus/${slug}`, {
      next: { revalidate: 60, tags: [`menu:${slug}`] },
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicMenu;
  } catch {
    return null;
  }
}

export async function checkSlug(
  slug: string,
): Promise<{ available: boolean; reason: string | null }> {
  return unwrap(
    await fetch(`${API}/api/public/slug-available/${slug}`, { cache: "no-store" }),
  );
}

/* ------------------------------------------------------------------- owner */

export async function extractMenu(files: File[]): Promise<ExtractResponse> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return unwrap(
    await fetch(`${API}/api/extract`, {
      method: "POST",
      headers: await authHeader(),
      body: form,
    }),
  );
}

export async function listRestaurants(): Promise<RestaurantSummary[]> {
  return unwrap(
    await fetch(`${API}/api/me/restaurants`, {
      headers: await authHeader(),
      cache: "no-store",
    }),
  );
}

export async function createRestaurant(input: {
  name: string;
  menu: Menu;
  slug?: string;
}): Promise<RestaurantSummary> {
  return unwrap(
    await fetch(`${API}/api/restaurants`, {
      method: "POST",
      headers: { ...(await authHeader()), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function getRestaurant(
  id: string,
): Promise<{
  restaurant: RestaurantSummary;
  menu: Menu;
  photos: Record<string, DishPhoto>;
}> {
  return unwrap(
    await fetch(`${API}/api/restaurants/${id}`, {
      headers: await authHeader(),
      cache: "no-store",
    }),
  );
}

export async function updateRestaurant(
  id: string,
  input: {
    name?: string;
    menu?: Menu;
    whatsapp?: string | null;
    /** Changing this changes the public address — printed QR codes break. */
    slug?: string;
  },
): Promise<RestaurantSummary> {
  return unwrap(
    await fetch(`${API}/api/restaurants/${id}`, {
      method: "PATCH",
      headers: { ...(await authHeader()), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function deleteRestaurant(id: string): Promise<void> {
  await unwrap<void>(
    await fetch(`${API}/api/restaurants/${id}`, {
      method: "DELETE",
      headers: await authHeader(),
    }),
  );
}

export async function startPublish(
  id: string,
  input: { generate_images: boolean; max_images: number; replace_existing?: boolean },
): Promise<PublishJob> {
  return unwrap(
    await fetch(`${API}/api/restaurants/${id}/publish`, {
      method: "POST",
      headers: { ...(await authHeader()), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function getPublishJob(jobId: string): Promise<PublishJob> {
  return unwrap(
    await fetch(`${API}/api/publish-jobs/${jobId}`, {
      headers: await authHeader(),
      cache: "no-store",
    }),
  );
}

/** QR images need the auth header, so fetch as a blob and hand back an object URL. */
export async function fetchQrObjectUrl(id: string, tent = false): Promise<string> {
  const res = await fetch(
    `${API}/api/restaurants/${id}/qr.png${tent ? "?tent=true" : ""}`,
    { headers: await authHeader() },
  );
  if (!res.ok) throw new Error("Could not generate the QR code.");
  return URL.createObjectURL(await res.blob());
}

/* -------------------------------------------------------------------- logo */

export async function uploadLogo(id: string, file: File): Promise<{ logo_url: string }> {
  const form = new FormData();
  form.append("file", file);
  return unwrap(
    await fetch(`${API}/api/restaurants/${id}/logo`, {
      method: "POST",
      headers: await authHeader(),
      body: form,
    }),
  );
}

export async function removeLogo(id: string): Promise<void> {
  await unwrap<void>(
    await fetch(`${API}/api/restaurants/${id}/logo`, {
      method: "DELETE",
      headers: await authHeader(),
    }),
  );
}

/* -------------------------------------------------------- per-dish photos */

export async function uploadDishPhoto(
  restaurantId: string,
  itemId: string,
  file: File,
): Promise<DishPhoto> {
  const form = new FormData();
  form.append("file", file);
  return unwrap(
    await fetch(`${API}/api/restaurants/${restaurantId}/items/${itemId}/photo`, {
      method: "POST",
      headers: await authHeader(),
      body: form,
    }),
  );
}

/** Ask for a different stock photo when the automatic match is wrong. */
export async function researchDishPhoto(
  restaurantId: string,
  itemId: string,
): Promise<DishPhoto> {
  return unwrap(
    await fetch(
      `${API}/api/restaurants/${restaurantId}/items/${itemId}/photo/search`,
      { method: "POST", headers: await authHeader() },
    ),
  );
}

export async function deleteDishPhoto(
  restaurantId: string,
  itemId: string,
): Promise<void> {
  await unwrap<void>(
    await fetch(`${API}/api/restaurants/${restaurantId}/items/${itemId}/photo`, {
      method: "DELETE",
      headers: await authHeader(),
    }),
  );
}
