import { fetchWithTimeout } from "@/lib/scan-utils";
import type { SecurityHeadersResult, SecurityHeaderResult } from "@/types/scan";

function checkHSTS(value: string | null): SecurityHeaderResult["status"] {
  if (!value) return "missing";
  const match = value.match(/max-age=(\d+)/i);
  if (match && parseInt(match[1], 10) >= 31536000) return "present";
  return "misconfigured";
}

function checkXFO(value: string | null): SecurityHeaderResult["status"] {
  if (!value) return "missing";
  if (value.toUpperCase() === "DENY" || value.toUpperCase() === "SAMEORIGIN") return "present";
  return "misconfigured";
}

function checkXCTO(value: string | null): SecurityHeaderResult["status"] {
  if (!value) return "missing";
  if (value.toLowerCase() === "nosniff") return "present";
  return "misconfigured";
}

function checkReferrerPolicy(value: string | null): SecurityHeaderResult["status"] {
  if (!value) return "missing";
  const restrictive = ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"];
  if (restrictive.includes(value.toLowerCase())) return "present";
  return "misconfigured";
}

function checkPresent(value: string | null): SecurityHeaderResult["status"] {
  return value ? "present" : "missing";
}

export async function scanSecurityHeaders(url: string): Promise<SecurityHeadersResult> {
  const response = await fetchWithTimeout(url);
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const results: SecurityHeaderResult[] = [
    { header: "Strict-Transport-Security", status: checkHSTS(headers["strict-transport-security"]), value: headers["strict-transport-security"] || null },
    { header: "Content-Security-Policy", status: checkPresent(headers["content-security-policy"]), value: headers["content-security-policy"] || null },
    { header: "X-Frame-Options", status: checkXFO(headers["x-frame-options"]), value: headers["x-frame-options"] || null },
    { header: "X-Content-Type-Options", status: checkXCTO(headers["x-content-type-options"]), value: headers["x-content-type-options"] || null },
    { header: "Referrer-Policy", status: checkReferrerPolicy(headers["referrer-policy"]), value: headers["referrer-policy"] || null },
    { header: "Permissions-Policy", status: checkPresent(headers["permissions-policy"]), value: headers["permissions-policy"] || null },
  ];

  const score = Math.round(
    results.reduce((acc, h) => {
      if (h.status === "present") return acc + (100 / 6);
      if (h.status === "misconfigured") return acc + (100 / 6 / 2);
      return acc;
    }, 0)
  );

  return { headers: results, score };
}
