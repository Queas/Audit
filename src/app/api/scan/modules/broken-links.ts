import { fetchWithTimeout } from "@/lib/scan-utils";
import type { BrokenLinksResult, BrokenLink } from "@/types/scan";

export async function scanBrokenLinks(url: string): Promise<BrokenLinksResult> {
  const response = await fetchWithTimeout(url);
  const html = await response.text();

  const baseUrl = new URL(url);
  const anchorRegex = /<a[^>]+href=["']([^"']+)["']/gi;
  const hrefs: string[] = [];
  let match;

  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("javascript:") || href.startsWith("mailto:")) continue;
    try {
      const resolved = new URL(href, baseUrl.origin).href;
      if (resolved.startsWith(baseUrl.origin)) {
        hrefs.push(resolved);
      }
    } catch {
      // invalid URL — skip
    }
  }

  const uniqueHrefs = [...new Set(hrefs)].slice(0, 20);
  const links: BrokenLink[] = [];

  await Promise.allSettled(
    uniqueHrefs.map(async (linkUrl) => {
      try {
        const res = await fetch(linkUrl, {
          method: "HEAD",
          headers: { "User-Agent": "WebIntelligence-Bot/1.0" },
          redirect: "follow",
          signal: AbortSignal.timeout(5000),
        });
        const code = res.status;
        let label: BrokenLink["label"] = "ok";
        if (code >= 400) label = "broken";
        else if (code >= 300 && code < 400) label = "redirect";
        links.push({ url: linkUrl, statusCode: code, label });
      } catch {
        links.push({ url: linkUrl, statusCode: null, label: "broken" });
      }
    })
  );

  return {
    checked: uniqueHrefs.length,
    total: hrefs.length,
    brokenCount: links.filter((l) => l.label === "broken").length,
    links,
  };
}
