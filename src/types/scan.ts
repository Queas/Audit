export interface ScanRequest {
  url: string;
}

export interface RateLimitInfo {
  remaining: number;
  resetsAt: string;
}

export interface OverviewResult {
  pageTitle: string | null;
  metaDescription: string | null;
  favicon: string | null;
  canonicalUrl: string | null;
  cms: string | null;
}

export interface SSLResult {
  valid: boolean;
  issuer: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  tlsVersion: string | null;
  status: 'healthy' | 'warning' | 'critical';
}

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

export interface DNSResult {
  records: DNSRecord[];
  providers: string[];
}

export interface SecurityHeaderResult {
  header: string;
  status: 'present' | 'missing' | 'misconfigured';
  value: string | null;
}

export interface SecurityHeadersResult {
  headers: SecurityHeaderResult[];
  score: number;
}

export interface MixedContentItem {
  type: 'script' | 'image' | 'stylesheet' | 'iframe' | 'form';
  url: string;
}

export interface MixedContentResult {
  totalInsecure: number;
  items: MixedContentItem[];
  risk: 'high' | 'medium' | 'low';
  remainingCount: number;
}

export interface SEOMetric {
  titleLength: { value: number; status: 'good' | 'warning' | 'issue' };
  metaDescriptionLength: { value: number; status: 'good' | 'warning' | 'issue' };
  h1Count: { value: number; status: 'good' | 'warning' | 'issue' };
  openGraphTags: { value: number; status: 'good' | 'warning' | 'issue' };
  twitterCard: { value: boolean; status: 'present' | 'missing' };
  canonicalTag: { value: boolean; status: 'present' | 'missing' };
  robotsTxt: { value: boolean; status: 'found' | 'not_found' };
  sitemap: { value: boolean; status: 'found' | 'not_found' };
  imageAltCoverage: { value: number; status: 'good' | 'warning' | 'issue' };
}

export interface SEOResult {
  metrics: SEOMetric;
  score: number;
}

export interface VitalMetric {
  value: string;
  status: 'good' | 'needs-improvement' | 'poor';
}

export interface VitalsResult {
  mobile: { lcp: VitalMetric; cls: VitalMetric; inp: VitalMetric; fcp: VitalMetric; ttfb: VitalMetric } | null;
  desktop: { lcp: VitalMetric; cls: VitalMetric; inp: VitalMetric; fcp: VitalMetric; ttfb: VitalMetric } | null;
  error: string | null;
}

export interface BrokenLink {
  url: string;
  statusCode: number | null;
  label: 'ok' | 'redirect' | 'broken';
}

export interface BrokenLinksResult {
  checked: number;
  total: number;
  brokenCount: number;
  links: BrokenLink[];
}

export interface GeoPreviewItem {
  region: string;
  imageUrl: string | null;
  error: boolean;
}

export interface GeoPreviewResult {
  previews: GeoPreviewItem[];
}

export interface UptimeResult {
  statusCode: number | null;
  responseTimeMs: number | null;
  timestamp: string;
  online: boolean;
  speedLabel: 'fast' | 'moderate' | 'slow';
}

export interface WHOISResult {
  registrar: string | null;
  registrationDate: string | null;
  expirationDate: string | null;
  domainAge: string | null;
}

export interface AIBreakdown {
  securityScore: number;
  seoScore: number;
  performanceScore: number;
  reliabilityScore: number;
  overall: number;
}

export interface AIResult {
  score: AIBreakdown;
  summary: string;
}

export interface ScanResponse {
  url: string;
  scannedAt: string;
  cached: boolean;
  rateLimit: RateLimitInfo;
  overview: OverviewResult | null;
  ssl: SSLResult | null;
  dns: DNSResult | null;
  securityHeaders: SecurityHeadersResult | null;
  mixedContent: MixedContentResult | null;
  seo: SEOResult | null;
  vitals: VitalsResult | null;
  brokenLinks: BrokenLinksResult | null;
  geoPreview: GeoPreviewResult | null;
  uptime: UptimeResult | null;
  whois: WHOISResult | null;
  ai: AIResult | null;
}
