import { fetchWithTimeout } from "@/lib/scan-utils";
import type { SEOResult, SEOMetric } from "@/types/scan";

export async function scanSEO(url: string): Promise<SEOResult> {
  const response = await fetchWithTimeout(url);
  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const titleLen = title.length;

  const descMatch = html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const desc = descMatch ? descMatch[1].trim() : "";
  const descLen = desc.length;

  const h1s = html.match(/<h1[^>]*>/gi);
  const h1Count = h1s ? h1s.length : 0;

  const ogTags = ["og:title", "og:description", "og:image", "og:url"];
  const ogPresent = ogTags.filter((tag) => {
    const re = new RegExp(`<meta[^>]+property=["']${tag}["']`, "i");
    return re.test(html);
  }).length;

  const hasTwitterCard = /<meta[^>]+name=["']twitter:card["']/i.test(html);
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const robotsUrl = new URL("/robots.txt", url).href;
  const sitemapUrl = new URL("/sitemap.xml", url).href;

  let robotsFound = false;
  let sitemapFound = false;
  try {
    const robotsRes = await fetchWithTimeout(robotsUrl);
    robotsFound = robotsRes.ok;
  } catch { /* not found */ }
  try {
    const sitemapRes = await fetchWithTimeout(sitemapUrl);
    sitemapFound = sitemapRes.ok;
  } catch { /* not found */ }

  const imgTags = html.match(/<img[^>]+>/gi) || [];
  const imgTotal = imgTags.length;
  const imgWithAlt = imgTags.filter((img) => /alt\s*=\s*["']/.test(img)).length;
  const imgAltPct = imgTotal > 0 ? Math.round((imgWithAlt / imgTotal) * 100) : 100;

  function titleStatus(len: number): SEOMetric["titleLength"]["status"] {
    if (len >= 50 && len <= 60) return "good";
    if ((len >= 40 && len <= 49) || (len >= 61 && len <= 70)) return "warning";
    return "issue";
  }

  function descStatus(len: number): SEOMetric["metaDescriptionLength"]["status"] {
    if (len >= 140 && len <= 160) return "good";
    if (len >= 100 && len <= 139) return "warning";
    return "issue";
  }

  function h1Status(count: number): SEOMetric["h1Count"]["status"] {
    if (count === 1) return "good";
    if (count === 0) return "warning";
    return "issue";
  }

  function ogStatus(count: number): SEOMetric["openGraphTags"]["status"] {
    if (count === 4) return "good";
    if (count >= 1 && count <= 3) return "warning";
    return "issue";
  }

  function altStatus(pct: number): SEOMetric["imageAltCoverage"]["status"] {
    if (pct > 90) return "good";
    if (pct >= 70) return "warning";
    return "issue";
  }

  const metrics: SEOMetric = {
    titleLength: { value: titleLen, status: titleStatus(titleLen) },
    metaDescriptionLength: { value: descLen, status: descStatus(descLen) },
    h1Count: { value: h1Count, status: h1Status(h1Count) },
    openGraphTags: { value: ogPresent, status: ogStatus(ogPresent) },
    twitterCard: { value: hasTwitterCard, status: hasTwitterCard ? "present" : "missing" },
    canonicalTag: { value: hasCanonical, status: hasCanonical ? "present" : "missing" },
    robotsTxt: { value: robotsFound, status: robotsFound ? "found" : "not_found" },
    sitemap: { value: sitemapFound, status: sitemapFound ? "found" : "not_found" },
    imageAltCoverage: { value: imgAltPct, status: altStatus(imgAltPct) },
  };

  const weights: Record<string, number> = {
    titleLength: 20,
    h1Count: 20,
    metaDescriptionLength: 15,
    openGraphTags: 10,
    twitterCard: 5,
    canonicalTag: 10,
    robotsTxt: 5,
    sitemap: 5,
    imageAltCoverage: 10,
  };

  let score = 0;
  let totalWeight = 0;
  for (const [key, weight] of Object.entries(weights)) {
    totalWeight += weight;
    const m = metrics[key as keyof SEOMetric] as { status: string };
    if (m.status === "good" || m.status === "present" || m.status === "found") score += weight;
    else if (m.status === "warning") score += weight * 0.5;
  }
  const finalScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;

  return { metrics, score: finalScore };
}
