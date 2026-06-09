"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Star, Calendar, ArrowRight, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

import { FilterService } from "@/services/filter";
import { SearchInfoSection } from "@/shared/components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/shared/utils";
import { format } from "date-fns";
import { useSafeContext } from "@/shared/hooks";
import { AppContext } from "@/features/app/providers/app.provider";

type ListItem =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
      categoryType?: string;
      categoryLabel?: string;
      badgeStyles?: string;
      unit?: string;
    }
  | undefined
  | null;

interface SearchClientProps {
  places: ListItem[];
  experiences: ListItem[];
  services: ListItem[];
}

export default function SearchClient({
  places = [],
  experiences = [],
  services = [],
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { filter, setFilter } = useSafeContext(AppContext);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setFilter(FilterService.get(params));
  }, [searchParams.toString()]);

  // Determine active category and appropriate list of items
  const { currentItems, categoryLabel, categoryType } = useMemo(() => {
    const type = filter?.type;

    const mappedPlaces = (places || []).filter(Boolean).map((item) => ({
      ...item,
      categoryType: "place",
      categoryLabel: "Nơi cư trú",
      badgeStyles:
        "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
      unit: "/đêm",
    }));

    const mappedExperiences = (experiences || [])
      .filter(Boolean)
      .map((item) => ({
        ...item,
        categoryType: "experience",
        categoryLabel: "Trải nghiệm",
        badgeStyles:
          "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
        unit: "/nhóm",
      }));

    const mappedServices = (services || []).filter(Boolean).map((item) => ({
      ...item,
      categoryType: "service",
      categoryLabel: "Dịch vụ",
      badgeStyles:
        "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
      unit: "/dịch vụ",
    }));

    if (type === "exp" || type === "experience") {
      return {
        currentItems: mappedExperiences,
        categoryLabel: "Trải nghiệm",
        categoryType: "experience",
      };
    } else if (type === "service") {
      return {
        currentItems: mappedServices,
        categoryLabel: "Dịch vụ",
        categoryType: "service",
      };
    } else if (type === "place") {
      return {
        currentItems: mappedPlaces,
        categoryLabel: "Nơi cư trú",
        categoryType: "place",
      };
    } else {
      return {
        currentItems: [
          ...mappedPlaces,
          ...mappedExperiences,
          ...mappedServices,
        ],
        categoryLabel: "Tất cả dịch vụ",
        categoryType: "all",
      };
    }
  }, [filter, places, experiences, services]);

  // Filter items by selected location (place)
  const filteredItems = useMemo(() => {
    const searchPlace = filter?.place?.trim().toLowerCase();
    if (!searchPlace) return currentItems;

    return currentItems.filter((item) => {
      if (!item) return false;
      const nameMatch = item.name?.toLowerCase().includes(searchPlace);
      const addressMatch = item.address?.toLowerCase().includes(searchPlace);
      const descMatch = item.description?.toLowerCase().includes(searchPlace);
      return nameMatch || addressMatch || descMatch;
    });
  }, [currentItems, filter]);

  // Handle new search from the search bar
  const handleSearchSubmit = (newFilter: any) => {
    const params = FilterService.set(newFilter);
    router.push(`/search?${params.toString()}`);
  };

  const getUnitSuffix = () => {
    if (categoryType === "place") return "/đêm";
    if (categoryType === "experience") return "/nhóm";
    return "/dịch vụ";
  };

  const getBadgeStyles = () => {
    if (categoryType === "place") {
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400";
    }
    if (categoryType === "experience") {
      return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400";
    }
    return "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400";
  };

  return (
    <div className="bg-app-bg text-app-fg min-h-screen pb-20">
      <div className="h-[70]" />
      {/* Top Search Bar Header */}
      <div className="mb-8 border-b bg-zinc-50 px-4 py-6 shadow-sm dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
          <div className="w-full max-w-3xl">
            {filter && (
              <SearchInfoSection
                filter={filter}
                onClickSearch={handleSearchSubmit}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6">
        {/* Results Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">
                {categoryLabel} tại {filter?.place || "mọi địa điểm"}
              </h1>
            </div>
            <p className="text-app-muted-fg mt-1 text-sm">
              Tìm thấy {filteredItems.length} kết quả phù hợp với tiêu chí của
              bạn
            </p>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {filter?.place && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 font-medium dark:bg-zinc-900"
              >
                <MapPin className="text-app-muted-fg mr-1 h-3.5 w-3.5" />
                {filter.place}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, place: "" };
                    handleSearchSubmit(newFilter);
                  }}
                  className="hover:text-zinc-650 ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  title="Xóa lọc địa điểm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filter?.date?.from && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full bg-zinc-50 px-3 py-1 font-medium dark:bg-zinc-900"
              >
                <Calendar className="text-app-muted-fg mr-1 h-3.5 w-3.5" />
                {format(new Date(filter.date.from), "dd/MM/yyyy")}
                {filter.date.to &&
                  ` - ${format(new Date(filter.date.to), "dd/MM/yyyy")}`}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, date: undefined };
                    handleSearchSubmit(newFilter);
                  }}
                  className="hover:text-zinc-650 ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                  title="Xóa lọc ngày"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filter?.type && filter.type !== "all" && (
              <Badge
                className={`flex items-center gap-1 rounded-full px-3 py-1 font-bold tracking-wider uppercase ${getBadgeStyles()}`}
              >
                {categoryLabel}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, type: "" };
                    handleSearchSubmit(newFilter);
                  }}
                  className="ml-1 rounded-full p-0.5 text-current transition-colors hover:bg-white/20"
                  title="Xóa lọc loại hình"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredItems.map((item, index) => {
              if (!item) return null;

              const itemCategoryType = item.categoryType || categoryType;
              const itemCategoryLabel = item.categoryLabel || categoryLabel;
              const itemBadgeStyles = item.badgeStyles || getBadgeStyles();
              const itemUnit = item.unit || getUnitSuffix();

              return (
                <motion.div
                  key={`${itemCategoryType}-${item.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    onClick={() =>
                      router.push(`/${itemCategoryType}/${item.id}/detail`)
                    }
                    className="group bg-app-card flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border border-zinc-100 transition-all duration-300 hover:border-zinc-200 hover:shadow-lg dark:border-zinc-800 dark:hover:border-zinc-700"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                      <img
                        src={item.image ?? undefined}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-103"
                      />
                      <Badge
                        className={`absolute top-4 left-4 z-10 rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase shadow-sm ${itemBadgeStyles}`}
                      >
                        {itemCategoryLabel}
                      </Badge>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>

                    {/* Content Area */}
                    <CardContent className="flex flex-grow flex-col justify-between p-4">
                      <div>
                        {/* Title */}
                        <h3 className="text-app-fg group-hover:text-app-primary line-clamp-1 text-sm font-bold transition-colors duration-300 sm:text-base">
                          {item.name}
                        </h3>

                        {/* Location */}
                        <div className="text-app-muted-fg mt-1 flex items-center gap-1 text-xs">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                          <span className="line-clamp-1">
                            {item.address || "Việt Nam"}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-app-muted-fg mt-2 line-clamp-2 text-xs leading-relaxed font-normal">
                          {item.description ||
                            "Trải nghiệm cao cấp cùng dịch vụ đỉnh cao của chúng tôi."}
                        </p>
                      </div>

                      {/* Pricing and Rating */}
                      <div className="mt-4 flex items-center justify-between border-t pt-3">
                        <div className="flex items-baseline">
                          <span className="text-sm font-extrabold text-rose-600 sm:text-base dark:text-rose-400">
                            đ{formatMoney(item.price ?? 0)}
                          </span>
                          <span className="text-app-muted-fg ml-0.5 text-[10px] font-light sm:text-xs">
                            {itemUnit}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 sm:text-sm">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{(item.rating ?? 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 py-20 text-center dark:border-zinc-800 dark:bg-zinc-900/30"
          >
            <div className="dark:bg-zinc-850 mb-4 rounded-full bg-white p-4 text-zinc-400 shadow-md">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-app-fg text-lg font-bold">
              Không tìm thấy kết quả nào
            </h2>
            <p className="text-app-muted-fg mt-2 max-w-sm px-4 text-sm">
              Chúng tôi không tìm thấy dịch vụ nào khớp với từ khóa "
              {filter?.place || ""}" tại thời điểm này.
            </p>
            <Button
              className="bg-app-primary hover:bg-app-primary/95 mt-6 rounded-xl px-5 font-semibold text-white"
              onClick={() => handleSearchSubmit({ place: "", type: "place" })}
            >
              Đặt lại bộ lọc
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
