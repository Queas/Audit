import type { WHOISResult } from "@/types/scan";

const WHOIS_API_KEY = process.env.WHOIS_API_KEY;

export async function scanWHOIS(url: string): Promise<WHOISResult> {
  if (!WHOIS_API_KEY) {
    return {
      registrar: null,
      registrationDate: null,
      expirationDate: null,
      domainAge: null,
    };
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;

    const response = await fetch(
      `https://api.whoisjson.com/v1/whois?domain=${domain}&apiKey=${WHOIS_API_KEY}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return {
        registrar: null,
        registrationDate: null,
        expirationDate: null,
        domainAge: null,
      };
    }

    const data = await response.json();

    let domainAge: string | null = null;
    if (data.createdDate) {
      const created = new Date(data.createdDate);
      const now = new Date();
      const years = now.getFullYear() - created.getFullYear();
      const months = now.getMonth() - created.getMonth();
      const totalMonths = years * 12 + months;
      if (totalMonths >= 12) {
        domainAge = `${Math.floor(totalMonths / 12)} year${Math.floor(totalMonths / 12) > 1 ? "s" : ""}`;
      } else {
        domainAge = `${totalMonths} month${totalMonths !== 1 ? "s" : ""}`;
      }
    }

    return {
      registrar: data.registrarName || data.registrar || null,
      registrationDate: data.createdDate || null,
      expirationDate: data.expiresDate || null,
      domainAge,
    };
  } catch {
    return {
      registrar: null,
      registrationDate: null,
      expirationDate: null,
      domainAge: null,
    };
  }
}
