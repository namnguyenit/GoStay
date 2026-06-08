"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";

import { FilterService } from "@/services/filter";
import { ComplexCarouselSections } from "@/shared/components";
import ListingGridCard from "@/shared/components/ListingGridCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useSafeContext } from "@/shared/hooks";
import { AppContext } from "@/features/app/providers/app.provider";
import type { Filter } from "@/modules/filter";
import type { ComplexOffering } from "@/services/complex";

type ListItem =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
      thumbnailUrl?: string;
      referenceImageUrl?: string;
      galleryUrls?: string[];
      images?: string[];
      imageUrls?: string[];
      subCategory?: string;
      categoryType?: string;
      categoryLabel?: string;
      unit?: string;
    }
  | undefined
  | null;

interface SearchClientProps {
  places: ListItem[];
  experiences: ListItem[];
  services: ListItem[];
  serviceCategoryItems?: ListItem[];
  complexes?: ComplexOffering[];
  searchParamsRaw: Record<string, string | string[] | undefined>;
}

const SERVICE_CATEGORY_OPTIONS = [
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

export default function SearchClient({
  places = [],
  experiences = [],
  services = [],
  serviceCategoryItems = [],
  complexes = [],
}: SearchClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { filter, setFilter } = useSafeContext(AppContext);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    setFilter(FilterService.get(params));
  }, [searchParams, setFilter]);

  // Determine active category and appropriate list of items
  const { currentItems, categoryLabel, categoryType } = useMemo(() => {
    const type = filter?.type;

    const mappedPlaces = (places || []).filter(Boolean).map(item => ({
      ...item,
      categoryType: "place",
      categoryLabel: "Nơi cư trú",
      unit: "/ đêm"
    }));

    const mappedExperiences = (experiences || []).filter(Boolean).map(item => ({
      ...item,
      categoryType: "experience",
      categoryLabel: "Trải nghiệm",
      unit: "/ nhóm"
    }));

    const mappedServices = (services || []).filter(Boolean).map(item => ({
      ...item,
      categoryType: "service",
      categoryLabel: "Dịch vụ",
      unit: "/ dịch vụ"
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
        currentItems: [...mappedPlaces, ...mappedExperiences, ...mappedServices],
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

  const serviceCategoryStats = useMemo(() => {
    const counts = new Map<string, { count: number; image?: string }>();

    (serviceCategoryItems || []).forEach((item) => {
      if (!item?.subCategory) return;
      const current = counts.get(item.subCategory) ?? { count: 0, image: undefined };
      counts.set(item.subCategory, {
        count: current.count + 1,
        image:
          current.image ||
          item.thumbnailUrl ||
          item.image ||
          item.galleryUrls?.[0] ||
          item.images?.[0] ||
          item.imageUrls?.[0],
      });
    });

    return SERVICE_CATEGORY_OPTIONS.map((option) => ({
      ...option,
      count: counts.get(option.value)?.count ?? 0,
      image: counts.get(option.value)?.image,
    })).filter((option) => option.count > 0);
  }, [serviceCategoryItems]);

  // Handle new search from the search bar
  const handleSearchSubmit = (newFilter: Filter) => {
    const params = FilterService.set(newFilter);
    router.push(`/search?${params.toString()}`);
  };

  const getUnitSuffix = () => {
    if (categoryType === "place") return "/ đêm";
    if (categoryType === "experience") return "/ nhóm";
    return "/ dịch vụ";
  };

  const getBadgeStyles = () => {
    return "border border-[#DDDDDD] bg-[#F7F7F7] text-[#222222]";
  };

  const activeServiceCategory = SERVICE_CATEGORY_OPTIONS.find(
    (item) => item.value === filter?.subCategory,
  );
  const isServiceSearch = categoryType === "service";
  const serviceExploreTitle = activeServiceCategory
    ? `Khám phá ${filteredItems.length} dịch vụ ${activeServiceCategory.label.toLowerCase()}`
    : `Khám phá ${filteredItems.length} dịch vụ`;

  const handleServiceCategoryClick = (subCategory: string) => {
    handleSearchSubmit({
      ...(filter ?? {}),
      type: "service",
      subCategory,
    });
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-[#222222]">
      <div className="h-[70px]" />
      <div className="mx-auto max-w-[1760px] px-6 md:px-10 xl:px-20">
        {/* Results Header */}
        {!isServiceSearch && (
        <div className="mb-8 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
                {categoryLabel} tại {filter?.place || "mọi địa điểm"}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#717171]">
              Tìm thấy {filteredItems.length} kết quả phù hợp với tiêu chí của
              bạn
            </p>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {filter?.place && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium"
              >
                <MapPin className="mr-1 h-3.5 w-3.5 text-[#717171]" />
                {filter.place}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, place: "" };
                    handleSearchSubmit(newFilter);
                  }}
                  className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                  title="Xóa lọc địa điểm"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filter?.date?.from && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium"
              >
                <Calendar className="mr-1 h-3.5 w-3.5 text-[#717171]" />
                {format(new Date(filter.date.from), "dd/MM/yyyy")}
                {filter.date.to &&
                  ` - ${format(new Date(filter.date.to), "dd/MM/yyyy")}`}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, date: undefined };
                    handleSearchSubmit(newFilter);
                  }}
                  className="ml-1 rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
                  title="Xóa lọc ngày"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filter?.type && filter.type !== "all" && (
              <Badge
                className={`rounded-full px-3 py-1 font-bold tracking-wider uppercase flex items-center gap-1 ${getBadgeStyles()}`}
              >
                {categoryLabel}
                <button
                  onClick={() => {
                    const newFilter = { ...filter, type: "" };
                    handleSearchSubmit(newFilter);
                  }}
                  className="hover:bg-white/20 text-current ml-1 rounded-full p-0.5 transition-colors"
                  title="Xóa lọc loại hình"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
        )}

        {/* Results Grid */}
        {!isServiceSearch && (
          <ComplexCarouselSections
          complexes={complexes}
          title={`Khu du lịch & tổ hợp gợi ý tại ${filter?.place || "mọi địa điểm"}`}
          maxItemsPerGroup={12}
          />
        )}

        {isServiceSearch && serviceCategoryStats.length > 0 && (
          <section className="mb-10">
            <h1 className="mb-4 text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
              Dịch vụ ở khu vực lân cận
            </h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
              {serviceCategoryStats.map((category) => {
                const selected = filter?.subCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleServiceCategoryClick(category.value)}
                    className="group text-left"
                  >
                    <div
                      className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#f7f7f7] transition ${
                        selected
                          ? "ring-2 ring-[#222222] ring-offset-2"
                          : "group-hover:ring-1 group-hover:ring-[#222222]/30 group-hover:ring-offset-2"
                      }`}
                    >
                      {category.image ? (
                        <Image
                          unoptimized
                          fill
                          src={category.image}
                          alt={category.label}
                          className="object-cover"
                          sizes="180px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-sm font-semibold text-[#717171]">
                          GoTravel
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-semibold text-[#222222]">
                      {category.label}
                    </div>
                    <div className="mt-0.5 text-sm text-[#717171]">
                      Có {category.count} dịch vụ
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {isServiceSearch && (
          <h2 className="mb-5 text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
            {serviceExploreTitle}
          </h2>
        )}

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredItems.map((item, index) => {
              if (!item) return null;

              const itemCategoryType = item.categoryType || categoryType;
              const itemCategoryLabel = item.categoryLabel || categoryLabel;
              const itemUnit = item.unit || getUnitSuffix();

              return (
                <motion.div
                  key={`${itemCategoryType}-${item.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListingGridCard
                    item={item}
                    categoryLabel={itemCategoryLabel}
                    unit={itemUnit}
                    onSelect={() =>
                      router.push(`/${itemCategoryType}/${item.id}/detail`)
                    }
                  />
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
              Chúng tôi không tìm thấy dịch vụ nào khớp với từ khóa
              &quot;{filter?.place || ""}&quot; tại thời điểm này.
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
