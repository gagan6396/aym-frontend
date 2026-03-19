// ═══════════════════════════════════════════════════════
// FILE LOCATION: src/app/aym-yoga-blog/[slug]/page.tsx
// ═══════════════════════════════════════════════════════

import SingleBlog from "@/components/singleblog/Singleblog";
import { notFound } from "next/navigation";

// ✅ Force dynamic rendering — static build mein 404 nahi aayega
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ─────────────────────────────────────────────
   BASE URL — same logic jo api.ts use karta hai
   NEXT_PUBLIC_API_URL = "http://localhost:5000"
   api.ts adds "/api" → "http://localhost:5000/api"
   Hum bhi wahi karenge yahan
───────────────────────────────────────────── */
const BASE = `${process.env.NEXT_PUBLIC_API_URL}/api`;

/* ─────────────────────────────────────────────
   NORMALISE — backend raw data → frontend Blog shape
───────────────────────────────────────────── */
function normalise(raw: any) {
  // Image URL fix: agar relative path hai toh base origin lagao
  const origin = process.env.NEXT_PUBLIC_API_URL ?? "";
  const image = raw.coverImage
    ? raw.coverImage.startsWith("http")
      ? raw.coverImage
      : `${origin}${raw.coverImage}`
    : "";

  return {
    id: raw._id ?? raw.id ?? "",
    slug: raw.slug ?? "",
    title: raw.title ?? "",
    excerpt: raw.excerpt ?? "",
    date: raw.date
      ? new Date(raw.date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "",
    author: raw.author || undefined,
    category: raw.category ?? "",
    image,
    tags: raw.tags ?? [],
    content: raw.content ?? [],
  };
}

/* ─────────────────────────────────────────────
   METADATA
───────────────────────────────────────────── */
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  try {
    const res = await fetch(
      `${BASE}/blogs/get-by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    if (!data.success || !data.data) return {};

    return {
      title: `${data.data.title} | AYM Yoga Blog`,
      description: data.data.excerpt,
    };
  } catch {
    return {};
  }
}

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export default async function SingleBlogPage({ params }: PageProps) {
  const { slug } = await params;

  /* ── 1. Current blog by slug ── */
  let blog: ReturnType<typeof normalise>;

  try {
    const res = await fetch(
      `${BASE}/blogs/get-by-slug/${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );

    if (!res.ok) return notFound();

    const data = await res.json();
    if (!data.success || !data.data) return notFound();

    blog = normalise(data.data);
  } catch {
    return notFound();
  }

  /* ── 2. All published blogs — for sidebar (related + recent) ── */
  let allBlogs: ReturnType<typeof normalise>[] = [];

  try {
    const res = await fetch(`${BASE}/blogs/get-all`, { cache: "no-store" });
    const data = await res.json();

    allBlogs = (data.data ?? [])
      .filter((b: any) => b.status === "Published")
      .map(normalise);
  } catch {
    // Non-fatal: sidebar empty rahega, page toh open hoga
  }

  /* ── 3. Related posts — same category, current blog exclude ── */
  const relatedPosts = allBlogs
    .filter((b) => b.category === blog.category && b.id !== blog.id)
    .slice(0, 6);

  /* ── 4. Recent posts — latest 5, current blog exclude ── */
  const recentPosts = allBlogs
    .filter((b) => b.id !== blog.id)
    .slice(0, 5);

  return (
    <SingleBlog
      blog={blog}
      relatedPosts={relatedPosts}
      recentPosts={recentPosts}
    />
  );
}