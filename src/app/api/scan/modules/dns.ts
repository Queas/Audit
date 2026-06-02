import { extractDomain, detectDNSProviders } from "@/lib/scan-utils";
import type { DNSResult } from "@/types/scan";
import dns from "dns";

export async function scanDNS(url: string): Promise<DNSResult> {
  const domain = extractDomain(url);
  const records: DNSResult["records"] = [];

  const types = ["A", "AAAA", "MX", "NS", "TXT"] as const;

  await Promise.allSettled(
    types.map(async (type) => {
      try {
        let values: string[] = [];
        switch (type) {
          case "A": {
            const res = await dns.promises.resolve4(domain);
            values = res;
            break;
          }
          case "AAAA": {
            const res = await dns.promises.resolve6(domain);
            values = res;
            break;
          }
          case "MX": {
            const res = await dns.promises.resolveMx(domain);
            values = res.map((r) => `${r.exchange} (priority ${r.priority})`);
            break;
          }
          case "NS": {
            const res = await dns.promises.resolveNs(domain);
            values = res;
            break;
          }
          case "TXT": {
            const res = await dns.promises.resolveTxt(domain);
            values = res.map((r) => r.join(""));
            break;
          }
        }
        for (const value of values) {
          records.push({ type, name: domain, value });
        }
      } catch {
        // Record type not available
      }
    })
  );

  return {
    records,
    providers: detectDNSProviders(records),
  };
}
