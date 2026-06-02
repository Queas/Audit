import type { UptimeResult } from "@/types/scan";

export async function scanUptime(url: string): Promise<UptimeResult> {
  const startTime = performance.now();
  let statusCode: number | null = null;
  let online = false;

  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": "WebIntelligence-Bot/1.0" },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
    });
    statusCode = response.status;
    online = statusCode >= 200 && statusCode < 400;
  } catch {
    statusCode = null;
    online = false;
  }

  const responseTimeMs = Math.round(performance.now() - startTime);

  let speedLabel: UptimeResult["speedLabel"] = "slow";
  if (responseTimeMs < 300) speedLabel = "fast";
  else if (responseTimeMs <= 1000) speedLabel = "moderate";

  return {
    statusCode,
    responseTimeMs,
    timestamp: new Date().toISOString(),
    online,
    speedLabel,
  };
}
