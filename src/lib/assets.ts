// Public project URL, never a secret. Override for another Supabase project.
const origin =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://feqmnzutyhzochuyiint.supabase.co";
export const publicAsset = (name: string) =>
  `${origin}/storage/v1/object/public/website-public/${name}`;
export const travelPhoto = (id: string) => publicAsset(`catalogue/${id}.jpg`);
// Admin uploads are stored once in two fixed sizes and served straight from
// Storage: content/{contentId}/{imageId}-1600.webp and -640.webp. The 1600
// link is what content records store.
const managedUpload =
  /\/storage\/v1\/object\/public\/website-public\/(content\/[a-zA-Z0-9-]+\/[a-f0-9-]{36})-1600\.webp$/;
export const isManagedUpload = (url: string) => managedUpload.test(url);
export const imageVariant = (url: string, size: "card" | "large") =>
  size === "card" && isManagedUpload(url)
    ? url.replace(/-1600\.webp$/, "-640.webp")
    : url;
// Pre-sized or privately served images must not go through the image optimiser.
export const skipOptimizer = (url: string) =>
  url.startsWith("/api/media/") || isManagedUpload(url);
export function managedObjectPaths(url: string) {
  const base = url.match(managedUpload)?.[1];
  return base ? [`${base}-1600.webp`, `${base}-640.webp`] : [];
}
