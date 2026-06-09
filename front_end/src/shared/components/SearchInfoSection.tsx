"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Filter } from "@/modules/filter";
import {
  ConciergeBell,
  Home,
  LocateFixed,
  MapPin,
  PartyPopper,
  Search,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { LayoutGroup, motion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Api } from "@/shared/api";

type SearchPanel = "place" | "date" | "type";

type SearchInfoSectionProps = {
  onClickSearch?: (value: Filter) => void;
  filter: Filter;
  initialOpen?: SearchPanel;
  className?: string;
  categoryContext?: "place" | "experience" | "service";
};

type LandmarkOption = {
  id?: string;
  name?: string;
  province?: string;
  description?: string;
  type?: string;
  thumbnailUrl?: string;
  referenceImageUrl?: string;
};

const DESTINATION_OPTIONS = [
  {
    id: "nearby",
    name: "Gần tôi",
    description: "Tìm dịch vụ xung quanh vị trí hiện tại",
    icon: LocateFixed,
  },
  {
    id: "hue",
    name: "Thành phố Huế",
    description: "Di sản, nghỉ dưỡng và trải nghiệm văn hóa",
    icon: MapPin,
  },
  {
    id: "danang",
    name: "Đà Nẵng",
    description: "Biển, khách sạn và dịch vụ du lịch",
    icon: MapPin,
  },
  {
    id: "hoian",
    name: "Hội An",
    description: "Phố cổ, homestay và trải nghiệm địa phương",
    icon: MapPin,
  },
  {
    id: "dalat",
    name: "Đà Lạt",
    description: "Villa, tour thiên nhiên và dịch vụ nghỉ dưỡng",
    icon: MapPin,
  },
  {
    id: "hcm",
    name: "TP. Hồ Chí Minh",
    description: "Lưu trú, ăn uống và dịch vụ đô thị",
    icon: MapPin,
  },
];

const TYPE_OPTIONS = [
  {
    value: "place",
    label: "Nơi lưu trú",
    description: "Khách sạn, resort, homestay, villa",
    icon: Home,
  },
  {
    value: "exp",
    label: "Trải nghiệm",
    description: "Tour, workshop, văn hóa, hoạt động địa phương",
    icon: PartyPopper,
  },
  {
    value: "service",
    label: "Dịch vụ",
    description: "Spa, ăn uống, thuê xe, makeup, catering",
    icon: ConciergeBell,
  },
];

const SERVICE_TYPE_OPTIONS = [
  { value: "PHOTOGRAPHY", label: "Chụp ảnh" },
  { value: "CHEF", label: "Đầu bếp" },
  { value: "MASSAGE", label: "Massage" },
  { value: "PREPARED_MEALS", label: "Đồ ăn chuẩn bị sẵn" },
  { value: "TRAINING", label: "Đào tạo" },
  { value: "MAKEUP", label: "Trang điểm" },
  { value: "HAIR_STYLING", label: "Làm tóc" },
  { value: "SPA", label: "Chăm sóc spa" },
  { value: "CATERING", label: "Dịch vụ ăn uống" },
];

const FLEXIBLE_DATE_OPTIONS = [
  "Ngày chính xác",
  "±1 ngày",
  "±2 ngày",
  "±3 ngày",
  "±7 ngày",
  "±14 ngày",
];

const formatDateRange = (date?: DateRange) => {
  if (!date?.from || !isValid(date.from)) return "Thêm ngày";
  if (!date.to || !isValid(date.to)) return format(date.from, "dd/MM/yyyy");
  return `${format(date.from, "dd/MM/yyyy")} - ${format(date.to, "dd/MM/yyyy")}`;
};

const normalizeText = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export default function SearchInfoSection({
  onClickSearch,
  filter,
  initialOpen,
  className,
  categoryContext,
}: SearchInfoSectionProps) {
  const [searchInfo, setSearchInfo] = useState<Filter>(filter);
  const [open, setOpen] = useState<SearchPanel | undefined>(initialOpen);
  const [dateMode, setDateMode] = useState<"date" | "flexible">("date");
  const [locationInput, setLocationInput] = useState(filter?.place ?? "");
  const [landmarks, setLandmarks] = useState<LandmarkOption[]>([]);
  const [loadingLandmarks, setLoadingLandmarks] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<SearchPanel>();
  const [isCompactViewport, setIsCompactViewport] = useState(false);
  const layoutGroupId = useId();
  const filterPlace = filter?.place;
  const filterType = filter?.type;
  const filterSubCategory = filter?.subCategory;
  const filterFromTime =
    filter?.date?.from && isValid(filter.date.from)
      ? filter.date.from.getTime()
      : undefined;
  const filterToTime =
    filter?.date?.to && isValid(filter.date.to)
      ? filter.date.to.getTime()
      : undefined;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsCompactViewport(mediaQuery.matches);
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const nextFilter: NonNullable<Filter> = {};

    if (filterPlace) nextFilter.place = filterPlace;
    if (filterType) nextFilter.type = filterType;
    if (filterSubCategory) nextFilter.subCategory = filterSubCategory;
    if (filterFromTime || filterToTime) {
      nextFilter.date = {
        from: filterFromTime ? new Date(filterFromTime) : undefined,
        to: filterToTime ? new Date(filterToTime) : undefined,
      };
    }

    setSearchInfo(nextFilter);
    setLocationInput(filterPlace ?? "");
  }, [filterPlace, filterType, filterSubCategory, filterFromTime, filterToTime]);

  useEffect(() => {
    setOpen(initialOpen);
  }, [initialOpen]);

  useEffect(() => {
    if (open !== "place") return;

    let cancelled = false;
    const query = locationInput.trim();

    if (!query) {
      queueMicrotask(() => {
        if (!cancelled) {
          setLandmarks([]);
          setLoadingLandmarks(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const timeout = window.setTimeout(() => {
      setLoadingLandmarks(true);

      Api.get(`/v1/search/locations/suggest?q=${encodeURIComponent(query)}`)
        .then((res) => {
          if (cancelled) return;
          const data = (res as { data?: unknown })?.data ?? res;
          setLandmarks(Array.isArray(data) ? (data as LandmarkOption[]) : []);
        })
        .catch(() => {
          if (!cancelled) setLandmarks([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingLandmarks(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [locationInput, open]);

  const updateSearchInfo = (patch: Partial<NonNullable<Filter>>) => {
    setSearchInfo((current) => ({
      ...(current ?? {}),
      ...patch,
    }));
  };

  const submitSearch = () => {
    setOpen(undefined);
    onClickSearch?.(searchInfo);
  };

  const landmarkSuggestions = useMemo(() => {
    const query = normalizeText(locationInput);
    const source = landmarks.filter((item) => item?.name);

    if (!query) return [];

    return source
      .filter((item) => {
        const haystack = normalizeText(
          `${item.name ?? ""} ${item.province ?? ""} ${item.description ?? ""}`,
        );
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [landmarks, locationInput]);

  const typeLabel =
    TYPE_OPTIONS.find((item) => item.value === searchInfo?.type)?.label ??
    "Tất cả loại hình";
  const serviceTypeLabel =
    SERVICE_TYPE_OPTIONS.find((item) => item.value === searchInfo?.subCategory)
      ?.label ?? "Thêm dịch vụ";
  const isServiceContext = categoryContext === "service";
  const dateLabel = formatDateRange(searchInfo?.date);
  const highlightedSegment = open ?? hoveredSegment;

  const activeSegmentClass =
    "bg-white shadow-[0_4px_16px_rgba(0,0,0,.11),0_1px_3px_rgba(0,0,0,.08)]";
  const hoverSegmentClass = "bg-[#f7f7f7]";
  const idleSegmentClass = open
    ? "bg-transparent hover:bg-[#dddddd]"
    : "bg-transparent";

  const dividerClass = (left: SearchPanel, right: SearchPanel) =>
    cn(
      "hidden h-8 w-px bg-[#dddddd] transition-opacity duration-150 md:block",
      (highlightedSegment === left || highlightedSegment === right) && "opacity-0",
    );

  const renderSegmentHighlight = (segment: SearchPanel) =>
    highlightedSegment === segment ? (
      <motion.span
        layoutId="search-segment-highlight"
        className={cn(
          "absolute inset-0 rounded-full",
          open === segment ? activeSegmentClass : hoverSegmentClass,
        )}
        transition={{
          type: "spring",
          stiffness: 460,
          damping: 38,
          mass: 0.85,
        }}
      />
    ) : null;

  return (
    <LayoutGroup id={layoutGroupId}>
      <div
        className={cn(
          "relative z-50 mx-auto flex w-full max-w-[850px] flex-col rounded-[36px] border border-[#dddddd] p-1 transition-all duration-200 md:grid md:h-[68px] md:grid-cols-[minmax(260px,1.35fr)_1px_minmax(210px,0.95fr)_1px_minmax(240px,1fr)_64px] md:items-center md:rounded-full",
          open
            ? "bg-[#ebebeb] shadow-[0_10px_32px_rgba(15,23,42,0.08)]"
            : "bg-white shadow-[0_3px_12px_rgba(0,0,0,.08),0_1px_2px_rgba(0,0,0,.05)]",
          className,
        )}
        onMouseLeave={() => setHoveredSegment(undefined)}
        role="search"
        aria-label="Tìm kiếm dịch vụ GoTravel"
      >
      <div
        className={cn(
          "relative z-30 flex min-h-[66px] min-w-0 items-center overflow-hidden rounded-full transition-colors duration-200 md:h-full md:min-h-0",
          open === "place" ? "" : idleSegmentClass,
        )}
        onMouseEnter={() => setHoveredSegment("place")}
      >
        {renderSegmentHighlight("place")}
        <Popover
          open={open === "place"}
          onOpenChange={(nextOpen) => setOpen(nextOpen ? "place" : undefined)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-start justify-center gap-1 rounded-full px-7 text-left outline-none md:pl-9 md:pr-8 lg:pl-10"
            >
              <span className="text-xs font-semibold text-[#222222]">Địa điểm</span>
              <span
                className={cn(
                  "truncate text-sm",
                  searchInfo?.place
                    ? "font-medium text-[#222222]"
                    : "font-normal text-[#6a6a6a]",
                )}
              >
                {searchInfo?.place || "Tìm kiếm điểm đến"}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="start"
            sideOffset={12}
            className="z-[70] w-[calc(100vw-32px)] max-w-[425px] rounded-[32px] border-none bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,.12)] md:p-6"
          >
            <div className="space-y-2">
              <div className="px-2 pb-2 text-xs font-semibold text-[#222222]">
                Bạn muốn đi đâu?
              </div>
              <div className="px-2 pb-3">
                <input
                  value={locationInput}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLocationInput(value);
                    updateSearchInfo({ place: value });
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      setOpen("date");
                    }
                  }}
                  placeholder="Gõ tên địa danh, tỉnh thành hoặc khu vực"
                  className="h-12 w-full rounded-2xl border border-[#dddddd] bg-white px-4 text-sm font-medium text-[#222222] outline-none transition-colors placeholder:text-[#717171] focus:border-[#222222]"
                  autoFocus
                />
              </div>

              {locationInput.trim() && (
                <button
                  type="button"
                  className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                  onClick={() => {
                    updateSearchInfo({ place: locationInput.trim() });
                    setOpen("date");
                  }}
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f7f7f7] text-[#222222]">
                    <Search className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-[#222222]">
                      Tìm &quot;{locationInput.trim()}&quot;
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-[#717171]">
                      Dùng địa điểm bạn vừa nhập
                    </span>
                  </span>
                </button>
              )}

              <div className="px-2 pt-2 pb-1 text-xs font-semibold text-[#222222]">
                {locationInput.trim() ? "Địa danh phù hợp" : "Địa danh từ hệ thống"}
              </div>

              {loadingLandmarks ? (
                <div className="px-3 py-4 text-sm text-[#717171]">
                  Đang tải địa danh...
                </div>
              ) : landmarkSuggestions.length > 0 ? (
                landmarkSuggestions.map((option) => (
                  <button
                    key={option.id ?? option.name}
                    type="button"
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                    onClick={() => {
                      updateSearchInfo({ place: option.name });
                      setLocationInput(option.name ?? "");
                      setOpen("date");
                    }}
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f7f7f7] text-[#222222]">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-[#222222]">
                        {option.name}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-[#717171]">
                        {[option.type, option.province || option.description]
                          .filter(Boolean)
                          .join(" · ") || "Địa danh GoTravel"}
                      </span>
                    </span>
                  </button>
                ))
              ) : locationInput.trim() ? (
                <div className="px-3 py-4 text-sm text-[#717171]">
                  Chưa có địa danh khớp trong hệ thống, bạn vẫn có thể tìm theo
                  text đã nhập.
                </div>
              ) : null}

              {!locationInput.trim() && DESTINATION_OPTIONS.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className="flex w-full items-center gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                    onClick={() => {
                      updateSearchInfo({ place: option.name });
                      setLocationInput(option.name);
                      setOpen("date");
                    }}
                  >
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#f7f7f7] text-[#222222]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-[#222222]">
                        {option.name}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-[#717171]">
                        {option.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className={dividerClass("place", "date")} />

      <div
        className={cn(
          "relative z-30 flex min-h-[66px] min-w-0 items-center overflow-hidden rounded-full transition-colors duration-200 md:h-full md:min-h-0",
          open === "date" ? "" : idleSegmentClass,
        )}
        onMouseEnter={() => setHoveredSegment("date")}
      >
        {renderSegmentHighlight("date")}
        <Popover
          open={open === "date"}
          onOpenChange={(nextOpen) => setOpen(nextOpen ? "date" : undefined)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-start justify-center gap-1 rounded-full px-7 text-left outline-none md:px-8 lg:px-9"
            >
              <span className="text-xs font-semibold text-[#222222]">Thời gian</span>
              <span
                className={cn(
                  "truncate text-sm",
                  searchInfo?.date?.from
                    ? "font-medium text-[#222222]"
                    : "font-normal text-[#6a6a6a]",
                )}
              >
                {dateLabel}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="center"
            sideOffset={12}
            className="z-[70] w-[calc(100vw-32px)] max-w-[850px] rounded-[32px] border-none bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,.12)] md:p-6"
          >
            <div className="flex flex-col items-center gap-5">
              <div className="rounded-full bg-[#f7f7f7] p-1">
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    dateMode === "date" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171]",
                  )}
                  onClick={() => setDateMode("date")}
                >
                  Ngày
                </button>
                <button
                  type="button"
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    dateMode === "flexible" ? "bg-white text-[#222222] shadow-sm" : "text-[#717171]",
                  )}
                  onClick={() => setDateMode("flexible")}
                >
                  Linh hoạt
                </button>
              </div>

              <Calendar
                mode="range"
                numberOfMonths={isCompactViewport ? 1 : 2}
                selected={searchInfo?.date}
                onSelect={(date) => updateSearchInfo({ date })}
                disabled={{ before: new Date() }}
                className="rounded-3xl bg-white"
              />

              <div className="flex w-full flex-wrap justify-center gap-2">
                {FLEXIBLE_DATE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="rounded-full border border-[#dddddd] px-4 py-2 text-sm font-medium text-[#222222] transition-colors hover:border-[#222222]"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="flex w-full items-center justify-between border-t border-[#eeeeee] pt-4">
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-[#222222] underline transition-colors hover:bg-[#f7f7f7]"
                  onClick={() => updateSearchInfo({ date: undefined })}
                >
                  Xóa
                </button>
                <button
                  type="button"
                  className="rounded-full bg-[#222222] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-black"
                  onClick={() => setOpen("type")}
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className={dividerClass("date", "type")} />

      <div
        className={cn(
          "relative z-30 flex min-h-[66px] min-w-0 items-center overflow-hidden rounded-full transition-colors duration-200 md:h-full md:min-h-0",
          open === "type" ? "" : idleSegmentClass,
        )}
        onMouseEnter={() => setHoveredSegment("type")}
      >
        {renderSegmentHighlight("type")}
        <Popover
          open={open === "type"}
          onOpenChange={(nextOpen) => setOpen(nextOpen ? "type" : undefined)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              className="relative z-10 flex h-full min-w-0 flex-1 flex-col items-start justify-center gap-1 rounded-full px-7 text-left outline-none md:pl-8 md:pr-5 lg:pl-9"
            >
              <span className="text-xs font-semibold text-[#222222]">
                {isServiceContext ? "Loại dịch vụ" : "Loại hình"}
              </span>
              <span
                className={cn(
                  "truncate text-sm",
                  isServiceContext ? searchInfo?.subCategory : searchInfo?.type
                    ? "font-medium text-[#222222]"
                    : "font-normal text-[#6a6a6a]",
                )}
              >
                {isServiceContext ? serviceTypeLabel : typeLabel}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="bottom"
            align="end"
            sideOffset={12}
            className="z-[70] w-[calc(100vw-32px)] max-w-[425px] rounded-[32px] border-none bg-white p-4 shadow-[0_8px_28px_rgba(0,0,0,.12)] md:p-6"
          >
            <div className="space-y-2">
              <div className="px-2 pb-2 text-xs font-semibold text-[#222222]">
                {isServiceContext ? "Chọn loại dịch vụ" : "Chọn loại hình dịch vụ"}
              </div>
              {isServiceContext ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SERVICE_TYPE_OPTIONS.map((option) => {
                    const selected = searchInfo?.subCategory === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "flex items-center justify-center rounded-full border px-4 py-3 text-sm font-semibold transition-colors",
                          selected
                            ? "border-[#222222] bg-[#222222] text-white"
                            : "border-[#dddddd] bg-white text-[#222222] hover:border-[#222222]",
                        )}
                        onClick={() => {
                          updateSearchInfo({
                            type: "service",
                            subCategory: option.value,
                          });
                          setOpen(undefined);
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = searchInfo?.type === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 rounded-2xl p-3 text-left transition-colors hover:bg-[#f7f7f7]"
                    onClick={() => {
                      updateSearchInfo({ type: option.value });
                      setOpen(undefined);
                    }}
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-[#dddddd] bg-[#f7f7f7] text-[#222222]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[15px] font-semibold text-[#222222]">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-[#717171]">
                          {option.description}
                        </span>
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-colors",
                        selected ? "border-[#222222]" : "border-[#b0b0b0]",
                      )}
                    >
                      {selected && (
                        <span className="h-3.5 w-3.5 rounded-full bg-[#222222]" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="relative z-30 flex min-h-[58px] items-center justify-end px-2 md:h-full md:min-h-0 md:justify-center md:px-0">
        <button
          type="button"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ff385c] text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#e61e4d] hover:shadow-lg active:scale-95"
          onClick={(event) => {
            event.stopPropagation();
            submitSearch();
          }}
          aria-label="Tìm kiếm"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      </div>
    </LayoutGroup>
  );
}
