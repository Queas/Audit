import type { VitalsResult, VitalMetric } from "@/types/scan";

interface LighthouseAudit {
  percentile?: number;
  displayValue?: string;
  distribution?: { proportion: number }[];
}

interface LighthouseResult {
  audits?: Record<string, LighthouseAudit>;
}

function extractMetric(lhr: LighthouseResult, path: string): VitalMetric | undefined {
  try {
    const parts = path.split(".");
    let current: unknown = lhr;
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = (current as Record<string, unknown>)[part];
      if (!current) return undefined;
    }
    const audit = current as LighthouseAudit;
    const value = audit?.percentile || audit?.displayValue || null;
    if (!value) return undefined;

    const distribution = audit?.distribution?.[0];
    const proportion = distribution?.proportion ?? 0;

    let status: VitalMetric["status"] = "good";
    if (proportion < 0.9) {
      if (proportion < 0.5) status = "poor";
      else status = "needs-improvement";
    }

    const displayValue = typeof value === "number"
      ? `${(value / 1000).toFixed(2)} s`
      : String(value);

    return { value: displayValue, status };
  } catch {
    return undefined;
  }
}

export async function scanVitals(url: string): Promise<VitalsResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return {
      mobile: null,
      desktop: null,
      error: "Performance data unavailable — PageSpeed Insights API key not configured",
    };
  }

  try {
    const apiUrl = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
    apiUrl.searchParams.set("url", url);
    apiUrl.searchParams.set("key", apiKey);
    apiUrl.searchParams.set("category", "PERFORMANCE");

    const response = await fetch(apiUrl.toString(), {
      headers: { "User-Agent": "WebIntelligence-Bot/1.0" },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      return {
        mobile: null,
        desktop: null,
        error: "Performance data unavailable — PageSpeed Insights API did not respond",
      };
    }

    const data = await response.json();

    const mobileLighthouse: LighthouseResult | undefined = data?.lighthouseResult || data?.mobile?.lighthouseResult;
    const desktopLighthouse: LighthouseResult | undefined = data?.lighthouseResult || data?.desktop?.lighthouseResult;

    const extractVitals = (lhr: LighthouseResult | undefined) => {
      if (!lhr?.audits) return null;
      return {
        lcp: extractMetric(lhr, "audits.largest-contentful-paint") || { value: "N/A", status: "poor" as const },
        cls: extractMetric(lhr, "audits.cumulative-layout-shift") || { value: "N/A", status: "poor" as const },
        inp: extractMetric(lhr, "audits.interaction-to-next-paint") || { value: "N/A", status: "poor" as const },
        fcp: extractMetric(lhr, "audits.first-contentful-paint") || { value: "N/A", status: "poor" as const },
        ttfb: extractMetric(lhr, "audits.server-response-time") || { value: "N/A", status: "poor" as const },
      };
    };

    return {
      mobile: extractVitals(mobileLighthouse),
      desktop: extractVitals(desktopLighthouse),
      error: null,
    };
  } catch {
    return {
      mobile: null,
      desktop: null,
      error: "Performance data unavailable — PageSpeed Insights API did not respond",
    };
  }
}
