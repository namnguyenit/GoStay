"use client";

import { ExternalLink, MapPin } from "lucide-react";

type LocationMapPreviewProps = {
  latitude?: number | string | null;
  longitude?: number | string | null;
  title?: string;
  address?: string;
  className?: string;
};

const isValidCoordinate = (value: number | string | null | undefined) =>
  Number.isFinite(Number(value));

export default function LocationMapPreview({
  latitude,
  longitude,
  title = "Vị trí trên bản đồ",
  address,
  className = "",
}: LocationMapPreviewProps) {
  const hasCoordinates = isValidCoordinate(latitude) && isValidCoordinate(longitude);
  const mapQuery = hasCoordinates ? `${latitude},${longitude}` : address || title;
  const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const googleMapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ${className}`}>
      <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h4 className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <MapPin className="h-4 w-4 text-sky-500" />
            {title}
          </h4>
          <p className="mt-1 truncate text-[11px] font-medium text-slate-500">
            {hasCoordinates ? `${Number(latitude).toFixed(6)}, ${Number(longitude).toFixed(6)}` : address || "Chưa có toạ độ hợp lệ."}
          </p>
        </div>
        <a
          href={googleMapOpenUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-900 underline underline-offset-4 hover:text-sky-600"
        >
          Mở Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="h-[260px] bg-slate-100">
        {hasCoordinates || address ? (
          <iframe
            title={title}
            src={googleMapEmbedUrl}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-xs font-medium text-slate-500">
            Chưa đủ dữ liệu để hiển thị bản đồ.
          </div>
        )}
      </div>
    </section>
  );
}
