import { fetchWithTimeout, detectCMS } from "@/lib/scan-utils";
import type { OverviewResult } from "@/types/scan";

export async function scanOverview(url: string): Promise<OverviewResult> {
  const response = await fetchWithTimeout(url);
  const html = await response.text();
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);

  let favicon = faviconMatch ? faviconMatch[1] : null;
  if (favicon && !favicon.startsWith("http")) {
    const base = new URL(url);
    favicon = new URL(favicon, base.origin).href;
  }

  return {
    pageTitle: titleMatch ? titleMatch[1].trim() : null,
    metaDescription: descMatch ? descMatch[1].trim() : null,
    favicon,
    canonicalUrl: canonicalMatch ? canonicalMatch[1] : null,
    cms: detectCMS(headers, html),
  };
}
