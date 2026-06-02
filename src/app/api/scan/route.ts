import { NextRequest } from "next/server";
import { validateUrl } from "@/lib/ssrf";
import { normalizeUrl } from "@/lib/scan-utils";
import { getCache, setCache, getRateLimitInfo, incrementRateLimit } from "@/lib/redis";
import { scanOverview } from "./modules/overview";
import { scanSSL } from "./modules/ssl";
import { scanDNS } from "./modules/dns";
import { scanSecurityHeaders } from "./modules/security-headers";
import { scanMixedContent } from "./modules/mixed-content";
import { scanSEO } from "./modules/seo";
import { scanVitals } from "./modules/vitals";
import { scanBrokenLinks } from "./modules/broken-links";
import { scanGeoPreview } from "./modules/geo-preview";
import { scanUptime } from "./modules/uptime";
import { scanWHOIS } from "./modules/whois";
import { scanAI } from "./modules/ai";
import type { ScanResponse, ScanRequest } from "@/types/scan";

const DAILY_LIMIT = 5;

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateInfo = await getRateLimitInfo(ip);
  const remaining = Math.max(0, DAILY_LIMIT - rateInfo.count);
  const resetsAt = new Date(Date.now() + (rateInfo.ttl || 86400) * 1000).toISOString();

  return Response.json({ remaining, resetsAt, limit: DAILY_LIMIT });
}

export async function POST(request: NextRequest) {
  try {
    let body: ScanRequest;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.url || typeof body.url !== "string") {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const url = normalizeUrl(body.url);

    const validation = await validateUrl(url);
    if (!validation.valid) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Check rate limit before incrementing
    const check = await getRateLimitInfo(ip);
    const resetsAt = new Date(Date.now() + (check.ttl || 86400) * 1000).toISOString();

    if (check.count >= DAILY_LIMIT) {
      return Response.json({
        error: "rate_limit",
        resetsAt,
        remaining: 0,
        message: "You've used your 5 free scans today. Come back tomorrow.",
      }, { status: 429 });
    }

    // Increment after confirming the user is under the limit
    const rateInfo = await incrementRateLimit(ip);
    const remaining = Math.max(0, DAILY_LIMIT - rateInfo.count);
    const effectiveResetsAt = new Date(Date.now() + (rateInfo.ttl || 86400) * 1000).toISOString();

    const cacheKey = `scan:${url.toLowerCase()}`;
    const cached = await getCache<ScanResponse>(cacheKey);
    if (cached.data) {
      return Response.json({
        ...cached.data,
        cached: true,
        rateLimit: { remaining, resetsAt: effectiveResetsAt },
      });
    }

    const scannedAt = new Date().toISOString();

    const [
      overviewResult,
      sslResult,
      dnsResult,
      securityHeadersResult,
      mixedContentResult,
      seoResult,
      vitalsResult,
      brokenLinksResult,
      geoPreviewResult,
      uptimeResult,
      whoisResult,
    ] = await Promise.allSettled([
      scanOverview(url),
      scanSSL(url),
      scanDNS(url),
      scanSecurityHeaders(url),
      scanMixedContent(url),
      scanSEO(url),
      scanVitals(url),
      scanBrokenLinks(url),
      scanGeoPreview(url),
      scanUptime(url),
      scanWHOIS(url),
    ]);

    const response: ScanResponse = {
      url,
      scannedAt,
      cached: false,
      rateLimit: { remaining, resetsAt: effectiveResetsAt },
      overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
      ssl: sslResult.status === "fulfilled" ? sslResult.value : null,
      dns: dnsResult.status === "fulfilled" ? dnsResult.value : null,
      securityHeaders: securityHeadersResult.status === "fulfilled" ? securityHeadersResult.value : null,
      mixedContent: mixedContentResult.status === "fulfilled" ? mixedContentResult.value : null,
      seo: seoResult.status === "fulfilled" ? seoResult.value : null,
      vitals: vitalsResult.status === "fulfilled" ? vitalsResult.value : null,
      brokenLinks: brokenLinksResult.status === "fulfilled" ? brokenLinksResult.value : null,
      geoPreview: geoPreviewResult.status === "fulfilled" ? geoPreviewResult.value : null,
      uptime: uptimeResult.status === "fulfilled" ? uptimeResult.value : null,
      whois: whoisResult.status === "fulfilled" ? whoisResult.value : null,
      ai: null,
    };

    // AI scan uses the full result — run last
    const aiResult = await scanAI(response).catch(() => null);
    response.ai = aiResult;

    await setCache(cacheKey, response);

    return Response.json(response);
  } catch (error) {
    console.error("Scan error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
