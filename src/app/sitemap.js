const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap() {
  const now = new Date();
  return ["", "/mentions-legales", "/confidentialite"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
  }));
}
