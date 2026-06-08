"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Search,
} from "lucide-react";
import { PROVINCES } from "@/shared/constants/provinces";

type LandmarkLocationValue = {
  name: string;
  suggestedProvince: string;
  suggestedLatitude: string;
  suggestedLongitude: string;
};

type LandmarkMapPickerProps = {
  value: LandmarkLocationValue;
  onChange: (patch: Partial<LandmarkLocationValue>) => void;
};

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    region?: string;
  };
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const findProvince = (result: NominatimResult) => {
  const haystack = normalizeText(
    [
      result.address?.state,
      result.address?.city,
      result.address?.town,
      result.address?.village,
      result.address?.county,
      result.display_name,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return (
    PROVINCES.find((province) => haystack.includes(normalizeText(province))) ??
    ""
  );
};

const getShortName = (result: NominatimResult) =>
  result.display_name.split(",")[0]?.trim() || result.display_name;

export default function LandmarkMapPicker({
  value,
  onChange,
}: LandmarkMapPickerProps) {
  const [query, setQuery] = useState(value.name);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const hasCoordinates =
    Number.isFinite(Number(value.suggestedLatitude)) &&
    Number.isFinite(Number(value.suggestedLongitude));

  const mapQuery = hasCoordinates
    ? `${value.suggestedLatitude},${value.suggestedLongitude}`
    : query || value.name || value.suggestedProvince || "Việt Nam";

  const googleMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`;
  const googleMapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const helperText = useMemo(() => {
    if (hasCoordinates) {
      return `Đang chọn: ${Number(value.suggestedLatitude).toFixed(6)}, ${Number(value.suggestedLongitude).toFixed(6)}`;
    }
    return "Tìm địa danh trên bản đồ để hệ thống tự điền toạ độ.";
  }, [hasCoordinates, value.suggestedLatitude, value.suggestedLongitude]);

  const searchLocations = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Vui lòng nhập tên địa danh cần tìm.");
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=vn&q=${encodeURIComponent(trimmedQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Không thể tìm địa danh lúc này.");
      }

      const data = (await response.json()) as NominatimResult[];
      setResults(data);

      if (data.length === 0) {
        setError("Không tìm thấy địa danh phù hợp tại Việt Nam.");
      } else {
        selectResult(data[0]);
      }
    } catch {
      setError("Không thể tìm địa danh. Bạn vẫn có thể nhập toạ độ thủ công.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: NominatimResult) => {
    const province = findProvince(result);
    const shortName = getShortName(result);
    setQuery(shortName);
    onChange({
      name: value.name || shortName,
      suggestedProvince: province || value.suggestedProvince,
      suggestedLatitude: Number(result.lat).toFixed(6),
      suggestedLongitude: Number(result.lon).toFixed(6),
    });
  };

  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          suggestedLatitude: position.coords.latitude.toFixed(6),
          suggestedLongitude: position.coords.longitude.toFixed(6),
        });
      },
      () => {
        setError("Không thể lấy vị trí hiện tại. Vui lòng cấp quyền vị trí hoặc nhập thủ công.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <MapPin className="h-4 w-4 text-app-primary" />
              Tìm địa danh trên bản đồ
            </h3>
            <p className="mt-1 text-xs text-gray-500">{helperText}</p>
          </div>
          <a
            href={googleMapOpenUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 underline underline-offset-4 hover:text-app-primary"
          >
            Mở Google Maps
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  searchLocations();
                }
              }}
              placeholder="Nhập tên địa danh, ví dụ: Bà Nà Hills, Hồ Hoàn Kiếm..."
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-app-primary focus:ring-1 focus:ring-app-primary"
            />
          </div>
          <button
            type="button"
            onClick={searchLocations}
            disabled={isSearching}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            {isSearching ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Tìm
          </button>
          <button
            type="button"
            onClick={useCurrentLocation}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-50"
          >
            <LocateFixed className="h-4 w-4" />
            Vị trí của tôi
          </button>
        </div>

        {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}

        {results.length > 0 && (
          <div className="mt-3 max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-1">
            {results.map((result) => (
              <button
                type="button"
                key={result.place_id}
                onClick={() => selectResult(result)}
                className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-white"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-app-primary" />
                <span>
                  <span className="block font-bold text-gray-900">
                    {getShortName(result)}
                  </span>
                  <span className="line-clamp-2 text-xs text-gray-500">
                    {result.display_name}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative h-[320px] bg-gray-100">
        <iframe
          title="Bản đồ địa danh đề xuất"
          src={googleMapEmbedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  );
}
