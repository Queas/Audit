import * as tls from "tls";
import { extractDomain } from "@/lib/scan-utils";
import type { SSLResult } from "@/types/scan";
import { getSSLStatus } from "@/lib/scan-utils";

export async function scanSSL(url: string): Promise<SSLResult> {
  const hostname = extractDomain(url);

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: 10000,
      },
      () => {
        const cert = socket.getPeerCertificate();
        const tlsVersion = socket.getProtocol();
        const daysRemaining = cert.valid_to
          ? Math.floor((new Date(cert.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null;

        socket.end();

        resolve({
          valid: !socket.authorizationError || socket.authorizationError.message.includes("self-signed"),
          issuer: (Array.isArray(cert.issuer?.O) ? cert.issuer.O[0] : cert.issuer?.O) || (Array.isArray(cert.issuer?.CN) ? cert.issuer.CN[0] : cert.issuer?.CN) || null,
          expiresAt: cert.valid_to || null,
          daysRemaining,
          tlsVersion,
          status: getSSLStatus(daysRemaining),
        });
      }
    );

    socket.on("error", () => {
      socket.destroy();
      resolve({
        valid: false,
        issuer: null,
        expiresAt: null,
        daysRemaining: null,
        tlsVersion: null,
        status: "critical",
      });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        valid: false,
        issuer: null,
        expiresAt: null,
        daysRemaining: null,
        tlsVersion: null,
        status: "critical",
      });
    });
  });
}
