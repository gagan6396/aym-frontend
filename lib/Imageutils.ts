/**
 * imageUtils.ts
 * Place this at: @/lib/imageUtils.ts
 *
 * Your api.ts sets baseURL = NEXT_PUBLIC_API_URL + "/api"
 * So NEXT_PUBLIC_API_URL is already the bare origin, e.g. "http://localhost:5000"
 * Image paths stored in DB are like "/uploads/filename.jpg"
 * → full URL = NEXT_PUBLIC_API_URL + "/uploads/filename.jpg"
 */

const ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

/**
 * resolveImage
 * Turns a DB-stored relative path into a full URL the browser can load.
 *   "/uploads/file.jpg"          → "http://localhost:5000/uploads/file.jpg"
 *   "http://..."  / "blob:..."   → unchanged (already absolute)
 *   ""  / undefined              → fallback
 */
export function resolveImage(src?: string, fallback = ""): string {
  if (!src) return fallback;
  if (src.startsWith("http") || src.startsWith("blob:")) return src;
  return `${ORIGIN}${src.startsWith("/") ? "" : "/"}${src}`;
}

/**
 * stripOrigin
 * Before saving back to the DB, remove the prepended origin so the DB
 * always stores clean relative paths.
 *   "http://localhost:5000/uploads/file.jpg" → "/uploads/file.jpg"
 *   "https://example.com/img.png"           → unchanged (external URL)
 *   "blob:..."                               → unchanged (new upload via file)
 */
export function stripOrigin(src: string): string {
  if (src.startsWith(ORIGIN)) return src.slice(ORIGIN.length);
  return src;
}