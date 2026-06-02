'use client';

import Image from "next/image";
import { MapPin } from "lucide-react";
import type { GeoPreviewResult } from "@/types/scan";

interface Props {
  data: GeoPreviewResult | null;
}

export function GeoPreviewCard({ data }: Props) {
  if (!data) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="h-4 w-4 text-[#00d4aa]" />
        <h3 className="text-sm font-medium text-zinc-200">Geo Preview</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {data.previews.map((preview) => (
          <div key={preview.region} className="relative aspect-video rounded-md overflow-hidden bg-zinc-800 group">
            {preview.imageUrl && !preview.error ? (
              <>
                <Image
                  src={preview.imageUrl}
                  alt={`${preview.region} preview`}
                  className="w-full h-full object-cover"
                  fill
                  unoptimized
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <span className="text-xs text-zinc-300 font-medium">{preview.region}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-2">
                  <MapPin className="h-4 w-4 text-zinc-700 mx-auto mb-1" />
                  <span className="text-xs text-zinc-700">{preview.region}</span>
                  <span className="text-xs text-zinc-700 block">Preview unavailable</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
