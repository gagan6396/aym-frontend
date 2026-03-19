// ═══════════════════════════════════════════════════
// FILE LOCATION: src/lib/blogs.ts
// ═══════════════════════════════════════════════════
// ✅ Sirf types hain — static allBlogs array hata diya
// Blogs ab API se dynamically aate hain

export type ImageLayout = "single" | "two-col" | "three-col" | "wide";

export interface BlogImage {
  src: string;
  caption: string;
}

export interface BlogSection {
  type: "heading" | "subheading" | "paragraph" | "images" | "divider";
  text?: string;
  images?: BlogImage[];
  imageLayout?: ImageLayout; // ✅ Admin se set hota hai
}

export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author?: string;
  category: string;
  image: string;
  tags?: string[];
  content?: BlogSection[];
}