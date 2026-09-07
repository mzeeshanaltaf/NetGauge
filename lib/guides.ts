// Single source of truth for the guide slugs/titles, so the sitemap, footer
// nav, and breadcrumbs can't drift out of sync with each other.
export const GUIDES = [
  { slug: "what-is-bufferbloat", title: "What Is Bufferbloat?" },
  { slug: "good-internet-speed", title: "What Is a Good Internet Speed?" },
  { slug: "speed-slower-than-advertised", title: "Why Is My Internet Slower Than Advertised?" },
] as const;

export type GuideSlug = (typeof GUIDES)[number]["slug"];
