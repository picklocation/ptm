// Public project URL, never a secret. Override for another Supabase project.
const origin =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://feqmnzutyhzochuyiint.supabase.co";
export const publicAsset = (name: string) =>
  `${origin}/storage/v1/object/public/website-public/${name}`;
export const travelPhoto = (id: string) => publicAsset(`catalogue/${id}.jpg`);
