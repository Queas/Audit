import type { GeoPreviewResult, GeoPreviewItem } from "@/types/scan";

const REGIONS = [
  { code: "us", label: "US" },
  { code: "sg", label: "Singapore" },
  { code: "de", label: "Germany" },
  { code: "au", label: "Australia" },
];

const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY;

export async function scanGeoPreview(url: string): Promise<GeoPreviewResult> {
  const previews: GeoPreviewItem[] = [];

  await Promise.allSettled(
    REGIONS.map(async (region) => {
      try {
        const encodedUrl = encodeURIComponent(url);
        let imageUrl: string | null = null;
        let error = false;

        if (SCREENSHOT_API_KEY) {
          imageUrl = `https://api.screenshotone.com/take?url=${encodedUrl}&access_key=${SCREENSHOT_API_KEY}&viewport_width=800&region=${region.code}`;
        } else {
          // Use Microlink free tier
          const response = await fetch(
            `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&viewport.width=800`,
            { signal: AbortSignal.timeout(15000) }
          );
          const data = await response.json();
          imageUrl = data?.data?.screenshot?.url || null;
          if (!imageUrl) error = true;
        }

        previews.push({ region: region.label, imageUrl, error });
      } catch {
        previews.push({ region: region.label, imageUrl: null, error: true });
      }
    })
  );

  return { previews };
}
