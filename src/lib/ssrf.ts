import { isPrivateIP, extractDomain } from "./scan-utils";

export async function validateUrl(input: string): Promise<{ valid: boolean; error?: string; url?: string }> {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { valid: false, error: "Only http and https URLs are allowed" };
  }

  try {
    const domain = extractDomain(input);
    const { Resolver } = await import("dns").then(m => ({ Resolver: m.promises.Resolver }));
    const resolver = new Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);
    const addresses = await resolver.resolve4(domain);
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return { valid: false, error: "URL resolves to a private IP address" };
      }
    }
  } catch {
    // DNS resolution failed — proceed with caution, will fail later if host is unreachable
  }

  return { valid: true, url: input };
}
