# Website Intelligence Platform

A portfolio-grade web application that accepts a single URL and returns a comprehensive website intelligence report — covering SSL, DNS, security headers, SEO, performance, mixed content, uptime, WHOIS, and geo preview — in one unified dark-mode dashboard.

**Live at:** [audit.jeremiahmagdael.com](https://audit.jeremiahmagdael.com)

---

## What It Demonstrates

| Skill | Evidence |
|---|---|
| **Full-stack engineering** | Next.js 15 App Router, TypeScript, API orchestration, Redis caching, Docker deployment |
| **Cybersecurity knowledge** | SSL/TLS analysis, security header evaluation, SSRF protection, mixed content detection, DNS record parsing |
| **SEO expertise** | Title/meta analysis, OG tag validation, Core Web Vitals integration, broken link detection, sitemap/robots check |
| **Product design** | Progressive card loading, dark-first UI, error resilience, rate limiting, no-auth UX |

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data fetching | TanStack Query |
| Caching | Redis (optional — graceful fallback) |
| Rate limiting | Redis-backed IP tracking (3 scans/day) |
| AI | OpenAI / Anthropic API (optional — fallback scoring) |

## Modules

1. **Website Overview** — title, meta description, favicon, canonical URL, CMS detection
2. **SSL Certificate** — validity, issuer, expiration, TLS version (via `tls.connect()`)
3. **DNS Intelligence** — A, AAAA, MX, NS, TXT records with provider detection
4. **Security Headers** — HSTS, CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy
5. **Mixed Content** — insecure resource detection with risk rating
6. **SEO Audit** — title, description, H1, OG tags, Twitter card, alt text, robots/sitemap
7. **Core Web Vitals** — LCP, CLS, INP, FCP, TTFB (via PageSpeed Insights API)
8. **Broken Links** — first 20 internal links checked via HEAD requests
9. **Geo Preview** — screenshot thumbnails from 4 regions
10. **Uptime Snapshot** — single-point status check with response time
11. **WHOIS Intelligence** — registrar, registration/expiration dates, domain age
12. **AI Summary** — overall score with component breakdown + executive summary

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- Redis (optional — app runs without it)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `PAGESPEED_API_KEY` | No (vitals module disabled) | Google PageSpeed Insights API key |
| `WHOIS_API_KEY` | No (WHOIS data unavailable) | whoisjson.com API key |
| `SCREENSHOT_API_KEY` | No (screenshots fall back) | ScreenshotOne API key |
| `AI_API_KEY` | No (basic scoring fallback) | OpenAI / Anthropic API key |
| `REDIS_URL` | No (no caching/rate limiting) | Redis connection string |

### Running Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
npm start
```

### Running with Docker

```bash
docker compose up -d
```

## Architecture

The app follows a single-page architecture with no route changes:

```
POST /api/scan → Promise.allSettled() → 12 parallel modules → AI summary → response
```

All server-side requests go through SSRF protection (validates URL scheme, resolves IP against private ranges). Results are cached for 15 minutes. Rate limiting is 3 scans per IP per day.

## API Keys

- **PageSpeed Insights:** [Google Cloud Console](https://console.cloud.google.com/) → enable "PageSpeed Insights API" (free, no billing required)
- **WHOIS:** [whoisjson.com](https://whoisjson.com/) → free tier
- **Screenshot:** [ScreenshotOne](https://screenshotone.com/) → free tier (250 credits)
- **AI:** [OpenAI](https://platform.openai.com/) or any OpenAI-compatible endpoint

## License

MIT
