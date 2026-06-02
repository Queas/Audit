import type { AIResult, ScanResponse } from "@/types/scan";

const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";
const AI_ENDPOINT = process.env.AI_ENDPOINT || "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are a website intelligence analyzer. Given structured scan data, produce two things:

1. An overall health score (0-100) with component breakdowns:
   - Security Score (0-100) — based on SSL status, security headers, mixed content, SSRF risks
   - SEO Score (0-100) — based on title, meta description, headings, OG tags, alt text, robots/sitemap
   - Performance Score (0-100) — based on Core Web Vitals, response time, uptime
   - Reliability Score (0-100) — based on WHOIS data (domain age), broken links, uptime consistency
   - Overall (0-100) — weighted average: Security 30%, SEO 25%, Performance 25%, Reliability 20%

2. An executive summary (100-150 words) that is specific and data-grounded. Reference actual findings: specific missing headers, actual SEO issues, real performance numbers. Do not be generic.

Reason step-by-step about the data before outputting. Output valid JSON only with this shape:
{
  "score": { "securityScore": number, "seoScore": number, "performanceScore": number, "reliabilityScore": number, "overall": number },
  "summary": "string"
}`;

export async function scanAI(scanResult: ScanResponse): Promise<AIResult> {
  if (!AI_API_KEY) {
    const modules = [
      scanResult.securityHeaders?.score,
      scanResult.seo?.score,
      scanResult.uptime?.online,
      scanResult.brokenLinks?.brokenCount,
    ];
    const hasAnyData = modules.some((m) => m !== undefined && m !== null);
    if (!hasAnyData) {
      return {
        score: { securityScore: 0, seoScore: 0, performanceScore: 0, reliabilityScore: 0, overall: 0 },
        summary: "AI summary unavailable — no API key configured.",
      };
    }
    // Generate a basic weighted score from available data
    const secScore = scanResult.securityHeaders?.score ?? 50;
    const seoScore = scanResult.seo?.score ?? 50;
    const perfScore = (() => {
      let s = 50;
      if (scanResult.uptime?.online) s += 20;
      if (scanResult.uptime?.speedLabel === "fast") s += 15;
      if (scanResult.uptime?.speedLabel === "moderate") s += 5;
      return Math.min(s, 100);
    })();
    const relScore = (() => {
      let s = 50;
      if (scanResult.brokenLinks && scanResult.brokenLinks.brokenCount === 0) s += 25;
      else if (scanResult.brokenLinks && scanResult.brokenLinks.brokenCount <= 3) s += 10;
      if (scanResult.whois?.domainAge) s += 15;
      if (scanResult.uptime?.online) s += 10;
      return Math.min(s, 100);
    })();
    const overall = Math.round(secScore * 0.3 + seoScore * 0.25 + perfScore * 0.25 + relScore * 0.2);

    const issues: string[] = [];
    if (scanResult.securityHeaders) {
      const missing = scanResult.securityHeaders.headers.filter((h) => h.status !== "present");
      if (missing.length > 0) issues.push(`${missing.length} security header${missing.length > 1 ? "s" : ""} missing or misconfigured`);
    }
    if (scanResult.seo) {
      if (scanResult.seo.score < 70) issues.push("SEO score below 70");
    }
    if (scanResult.mixedContent && scanResult.mixedContent.totalInsecure > 0) {
      issues.push(`${scanResult.mixedContent.totalInsecure} mixed content items`);
    }
    if (scanResult.brokenLinks && scanResult.brokenLinks.brokenCount > 0) {
      issues.push(`${scanResult.brokenLinks.brokenCount} broken link${scanResult.brokenLinks.brokenCount > 1 ? "s" : ""}`);
    }

    const summary = issues.length > 0
      ? `The scan identified ${issues.join(", ")}. Security score: ${secScore}/100, SEO: ${seoScore}/100, Performance: ${perfScore}/100, Reliability: ${relScore}/100. Overall health: ${overall}/100.`
      : `The website appears healthy. Security score: ${secScore}/100, SEO: ${seoScore}/100, Performance: ${perfScore}/100, Reliability: ${relScore}/100. Overall health: ${overall}/100.`;

    return {
      score: { securityScore: secScore, seoScore, performanceScore: perfScore, reliabilityScore: relScore, overall },
      summary,
    };
  }

  try {
    const payload = {
      model: AI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(omitLargeFields(scanResult)) },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    };

    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      throw new Error(`AI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    const parsed = JSON.parse(content);
    return {
      score: parsed.score,
      summary: parsed.summary,
    };
  } catch {
    return {
      score: { securityScore: 0, seoScore: 0, performanceScore: 0, reliabilityScore: 0, overall: 0 },
      summary: "AI summary unavailable — the analysis service did not respond.",
    };
  }
}

function omitLargeFields(result: ScanResponse): Partial<ScanResponse> {
  return {
    url: result.url,
    overview: result.overview,
    ssl: result.ssl,
    dns: result.dns,
    securityHeaders: result.securityHeaders,
    mixedContent: result.mixedContent ? { ...result.mixedContent, items: result.mixedContent.items.slice(0, 5) } : null,
    seo: result.seo,
    vitals: result.vitals,
    brokenLinks: result.brokenLinks ? { ...result.brokenLinks, links: result.brokenLinks.links.slice(0, 5) } : null,
    geoPreview: result.geoPreview,
    uptime: result.uptime,
    whois: result.whois,
  };
}
