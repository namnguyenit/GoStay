"use client";

import { useMemo, useState } from "react";
import { ExternalLink, LoaderCircle, LocateFixed, MapPin, Search } from "lucide-react";
import { PROVINCES } from "@/shared/constants/provinces";

export type CoordinatePickerValue = {
  name?: string;
  province?: string;
  latitude: string;
  longitude: string;
};

type CoordinatePickerPatch = Partial<CoordinatePickerValue>;

type LocationCoordinatePickerProps = {
  value: CoordinatePickerValue;
  onChange: (patch: CoordinatePickerPatch) => void;
  title?: string;
  hint?: string;
  searchPlaceholder?: string;
  allowNameOverwrite?: boolean;
  className?: string;
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

const TILE_SIZE = 256;
const ZOOM = 14;
const MAP_WIDTH = 960;
const MAP_HEIGHT = 360;
const DEFAULT_LATITUDE = 16.047079;
const DEFAULT_LONGITUDE = 108.20623;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

const clampLatitude = (latitude: number) => Math.max(Math.min(latitude, 85.05112878), -85.05112878);
const wrapLongitude = (longitude: number) => ((((longitude + 180) % 360) + 360) % 360) - 180;

const lngToWorldX = (longitude: number, zoom: number) =>
  ((wrapLongitude(longitude) + 180) / 360) * TILE_SIZE * 2 ** zoom;

const latToWorldY = (latitude: number, zoom: number) => {
  const latRad = (clampLatitude(latitude) * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * TILE_SIZE * 2 ** zoom;
};

const worldXToLng = (x: number, zoom: number) => wrapLongitude((x / (TILE_SIZE * 2 ** zoom)) * 360 - 180);

const worldYToLat = (y: number, zoom: number) => {
  const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * 2 ** zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
};

const isValidCoordinate = (value: string) => Number.isFinite(Number(value));

const getShortName = (result: NominatimResult) =>
  result.display_name.split(",")[0]?.trim() || result.display_name;

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

  return PROVINCES.find((province) => haystack.includes(normalizeText(province))) ?? "";
};

export default function LocationCoordinatePicker({
  value,
  onChange,
  title = "Chọn vị trí trên bản đồ",
  hint = "Tìm địa điểm hoặc bấm trực tiếp lên bản đồ để hệ thống tự lấy kinh độ, vĩ độ.",
  searchPlaceholder = "Nhập địa điểm, ví dụ: Hồ Hoàn Kiếm, Bà Nà Hills...",
  allowNameOverwrite = false,
  className = "",
}: LocationCoordinatePickerProps) {
  const [query, setQuery] = useState(value.name || value.province || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const latitude = isValidCoordinate(value.latitude) ? Number(value.latitude) : DEFAULT_LATITUDE;
  const longitude = isValidCoordinate(value.longitude) ? Number(value.longitude) : DEFAULT_LONGITUDE;
  const hasCoordinates = isValidCoordinate(value.latitude) && isValidCoordinate(value.longitude);
  const centerX = lngToWorldX(longitude, ZOOM);
  const centerY = latToWorldY(latitude, ZOOM);
  const topLeftX = centerX - MAP_WIDTH / 2;
  const topLeftY = centerY - MAP_HEIGHT / 2;
  const tileMinX = Math.floor(topLeftX / TILE_SIZE);
  const tileMaxX = Math.floor((topLeftX + MAP_WIDTH) / TILE_SIZE);
  const tileMinY = Math.floor(topLeftY / TILE_SIZE);
  const tileMaxY = Math.floor((topLeftY + MAP_HEIGHT) / TILE_SIZE);
  const maxTile = 2 ** ZOOM;

  const mapQuery = hasCoordinates
    ? `${value.latitude},${value.longitude}`
    : query || value.name || value.province || "Việt Nam";
  const googleMapOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const tiles = useMemo(() => {
    const list: Array<{ key: string; url: string; left: number; top: number }> = [];
    for (let x = tileMinX; x <= tileMaxX; x += 1) {
      for (let y = tileMinY; y <= tileMaxY; y += 1) {
        if (y < 0 || y >= maxTile) continue;
        const wrappedX = ((x % maxTile) + maxTile) % maxTile;
        list.push({
          key: `${wrappedX}-${y}`,
          url: `https://tile.openstreetmap.org/${ZOOM}/${wrappedX}/${y}.png`,
          left: x * TILE_SIZE - topLeftX,
          top: y * TILE_SIZE - topLeftY,
        });
      }
    }
    return list;
  }, [maxTile, tileMaxX, tileMaxY, tileMinX, tileMinY, topLeftX, topLeftY]);

  const applyCoordinates = (lat: number, lng: number, patch: CoordinatePickerPatch = {}) => {
    onChange({
      ...patch,
      latitude: clampLatitude(lat).toFixed(6),
      longitude: wrapLongitude(lng).toFixed(6),
    });
  };

  const selectResult = (result: NominatimResult) => {
    const shortName = getShortName(result);
    const province = findProvince(result);
    setQuery(shortName);
    applyCoordinates(Number(result.lat), Number(result.lon), {
      name: allowNameOverwrite ? shortName : value.name || shortName,
      province: province || value.province,
    });
  };

  const searchLocations = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Vui lòng nhập địa điểm cần tìm.");
      return;
    }

    setIsSearching(true);
    setError("");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=vn&q=${encodeURIComponent(trimmedQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Không thể tìm địa điểm lúc này.");
      }

      const data = (await response.json()) as NominatimResult[];
      setResults(data);

      if (data.length === 0) {
        setError("Không tìm thấy địa điểm phù hợp tại Việt Nam.");
      } else {
        selectResult(data[0]);
      }
    } catch {
      setError("Không thể tìm địa điểm. Bạn có thể bấm trực tiếp lên bản đồ để chọn vị trí.");
    } finally {
      setIsSearching(false);
    }
  };

  const useCurrentLocation = () => {
    setError("");
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyCoordinates(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError("Không thể lấy vị trí hiện tại. Vui lòng cấp quyền vị trí hoặc bấm lên bản đồ.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratioX = MAP_WIDTH / rect.width;
    const ratioY = MAP_HEIGHT / rect.height;
    const clickX = (event.clientX - rect.left) * ratioX;
    const clickY = (event.clientY - rect.top) * ratioY;
    const worldX = topLeftX + clickX;
    const worldY = topLeftY + clickY;
    applyCoordinates(worldYToLat(worldY, ZOOM), worldXToLng(worldX, ZOOM));
  };

  return (
    <section className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}>
      <div className="border-b border-gray-100 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
              <MapPin className="h-4 w-4 text-app-primary" />
              {title}
            </h3>
            <p className="mt-1 text-xs text-gray-500">{hint}</p>
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
              placeholder={searchPlaceholder}
              className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition-all focus:border-app-primary focus:ring-1 focus:ring-app-primary"
            />
          </div>
          <button
            type="button"
            onClick={searchLocations}
            disabled={isSearching}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
          >
            {isSearching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
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
                  <span className="block font-bold text-gray-900">{getShortName(result)}</span>
                  <span className="line-clamp-2 text-xs text-gray-500">{result.display_name}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-600">
        {hasCoordinates
          ? `Tọa độ đã chọn: ${Number(value.latitude).toFixed(6)}, ${Number(value.longitude).toFixed(6)}`
          : "Chưa chọn tọa độ. Bấm lên bản đồ hoặc tìm địa điểm để chọn."}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleMapClick}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            applyCoordinates(latitude, longitude);
          }
        }}
        className="relative h-[360px] cursor-crosshair overflow-hidden bg-slate-100"
        title="Bấm vào bản đồ để chọn tọa độ"
      >
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="absolute h-64 w-64 select-none bg-cover bg-center"
            style={{
              left: tile.left,
              top: tile.top,
              backgroundImage: `url(${tile.url})`,
            }}
          />
        ))}

        {hasCoordinates && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-app-primary text-white shadow-[0_10px_25px_rgba(244,63,94,0.35)] ring-4 ring-white">
              <MapPin className="h-5 w-5" />
              <span className="absolute -bottom-1.5 h-3 w-3 rotate-45 bg-app-primary" />
            </div>
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-bold text-gray-600 shadow-sm">
          Bấm vào bản đồ để đặt ghim
        </div>
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="absolute bottom-2 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 hover:underline"
        >
          © OpenStreetMap
        </a>
      </div>
    </section>
  );
}
