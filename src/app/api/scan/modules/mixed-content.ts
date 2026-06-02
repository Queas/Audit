import { fetchWithTimeout } from "@/lib/scan-utils";
import type { MixedContentResult, MixedContentItem } from "@/types/scan";

export async function scanMixedContent(url: string): Promise<MixedContentResult> {
  const response = await fetchWithTimeout(url);
  const html = await response.text();
  const items: MixedContentItem[] = [];

  const pattern = /(?:src|href|action|data)\s*=\s*["']http:\/\/([^"']+)["']/gi;
  let match;
  while ((match = pattern.exec(html)) !== null) {
    let type: MixedContentItem["type"] = "image";
    const fullUrl = `http://${match[1]}`;
    const context = html.substring(Math.max(0, match.index - 100), match.index + 200).toLowerCase();

    if (/\.js["'\s>]|script/i.test(context)) type = "script";
    else if (/\.css["'\s>]|stylesheet/i.test(context)) type = "stylesheet";
    else if (/<iframe/i.test(context)) type = "iframe";
    else if (/<form/i.test(context)) type = "form";
    else if (/\.(png|jpg|jpeg|gif|svg|webp|ico)["'\s>]/i.test(context)) type = "image";

    items.push({ type, url: fullUrl });
  }

  const highRisk = items.filter((i) => i.type === "script" || i.type === "iframe");
  const medRisk = items.filter((i) => i.type === "image" || i.type === "stylesheet" || i.type === "form");

  let risk: MixedContentResult["risk"] = "low";
  if (highRisk.length > 0) risk = "high";
  else if (medRisk.length > 0) risk = "medium";

  const remainingCount = items.length > 10 ? items.length - 10 : 0;
  const displayItems = items.slice(0, 10);

  return {
    totalInsecure: items.length,
    items: displayItems,
    risk,
    remainingCount,
  };
}
