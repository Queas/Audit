'use client';

import type { ReactElement } from "react";
import type { ScanResponse } from "@/types/scan";
import { OverviewCard } from "./modules/OverviewCard";
import { SSLCard } from "./modules/SSLCard";
import { DNSCard } from "./modules/DNSCard";
import { SecurityHeadersCard } from "./modules/SecurityHeadersCard";
import { MixedContentCard } from "./modules/MixedContentCard";
import { SEOCard } from "./modules/SEOCard";
import { VitalsCard } from "./modules/VitalsCard";
import { BrokenLinksCard } from "./modules/BrokenLinksCard";
import { GeoPreviewCard } from "./modules/GeoPreviewCard";
import { UptimeCard } from "./modules/UptimeCard";
import { WHOISCard } from "./modules/WHOISCard";
import { AISummaryCard } from "./modules/AISummaryCard";
import { SkeletonCard } from "./ui/SkeletonCard";
import { ErrorCard } from "./ui/ErrorCard";

interface ResultsGridProps {
  result: ScanResponse | null;
  isLoading: boolean;
}

type CardComponent<T> = (props: { data: T }) => ReactElement | null;

export function ResultsGrid({ result, isLoading }: ResultsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!result) return null;

  const modules: { key: string; data: unknown; component: CardComponent<unknown> }[] = [
    { key: "overview", data: result.overview, component: OverviewCard as CardComponent<unknown> },
    { key: "ssl", data: result.ssl, component: SSLCard as CardComponent<unknown> },
    { key: "dns", data: result.dns, component: DNSCard as CardComponent<unknown> },
    { key: "securityHeaders", data: result.securityHeaders, component: SecurityHeadersCard as CardComponent<unknown> },
    { key: "mixedContent", data: result.mixedContent, component: MixedContentCard as CardComponent<unknown> },
    { key: "seo", data: result.seo, component: SEOCard as CardComponent<unknown> },
    { key: "vitals", data: result.vitals, component: VitalsCard as CardComponent<unknown> },
    { key: "brokenLinks", data: result.brokenLinks, component: BrokenLinksCard as CardComponent<unknown> },
    { key: "geoPreview", data: result.geoPreview, component: GeoPreviewCard as CardComponent<unknown> },
    { key: "uptime", data: result.uptime, component: UptimeCard as CardComponent<unknown> },
    { key: "whois", data: result.whois, component: WHOISCard as CardComponent<unknown> },
  ];

  return (
    <div className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => {
          const Component = mod.component;
          if (mod.data === null) {
            return (
              <ErrorCard
                key={mod.key}
                title={mod.key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                message="Data unavailable"
              />
            );
          }
          return <Component key={mod.key} data={mod.data} />;
        })}
      </div>
      {result.ai && (
        <div className="mt-4">
          <AISummaryCard data={result.ai} />
        </div>
      )}
    </div>
  );
}
