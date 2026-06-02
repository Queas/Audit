import type { DNSRecord } from "@/types/scan";

export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  return url.replace(/\/+$/, "");
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function isPrivateIP(ip: string): boolean {
  if (ip === "::1" || ip === "127.0.0.1") return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1], 10);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

export function detectCMS(headers: Record<string, string>, html: string): string | null {
  if (headers["x-powered-by"]) {
    const powered = headers["x-powered-by"].toLowerCase();
    if (powered.includes("express")) return "Express";
    if (powered.includes("next.js")) return "Next.js";
    if (powered.includes("php")) return "PHP";
    if (powered.includes("asp.net")) return "ASP.NET";
  }
  if (headers["x-generator"]) return headers["x-generator"];
  const generatorMatch = html.match(/<meta\s+name=["']generator["'][^>]+content=["']([^"']+)["']/i);
  if (generatorMatch) return generatorMatch[1];
  if (/wp-content|wp-includes/i.test(html)) return "WordPress";
  if (/shopify\.com|Shopify\.shop/i.test(html)) return "Shopify";
  if (/__NEXT_DATA__|next\.js/i.test(html)) return "Next.js";
  if (html.includes("data-wf-page=")) return "Webflow";
  if (/laravel|livewire/i.test(html)) return "Laravel";
  return null;
}

export function detectDNSProviders(records: DNSRecord[]): string[] {
  const providers: string[] = [];
  for (const r of records) {
    if (r.type === "NS" && r.value.includes("cloudflare")) {
      if (!providers.includes("Cloudflare")) providers.push("Cloudflare");
    }
    if (r.type === "MX") {
      if (r.value.includes("aspmx.l.google.com") && !providers.includes("Google Workspace")) {
        providers.push("Google Workspace");
      }
      if (r.value.includes("mail.protection.outlook.com") && !providers.includes("Microsoft 365")) {
        providers.push("Microsoft 365");
      }
    }
    if (r.type === "NS" && r.value.includes("awsdns") && !providers.includes("AWS Route 53")) {
      providers.push("AWS Route 53");
    }
  }
  return providers;
}

export function getSSLStatus(daysRemaining: number | null): 'healthy' | 'warning' | 'critical' {
  if (daysRemaining === null) return 'critical';
  if (daysRemaining > 30) return 'healthy';
  if (daysRemaining >= 8) return 'warning';
  return 'critical';
}

const USER_AGENT = "WebIntelligence-Bot/1.0 (+https://audit.jeremiahmagdael.com)";

export async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": USER_AGENT },
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}
