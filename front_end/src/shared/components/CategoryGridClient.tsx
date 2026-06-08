"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { FilterService } from "@/services/filter";
import ListingGridCard from "./ListingGridCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Filter } from "@/modules/filter";

type ListItem =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
      subCategory?: string;
      thumbnailUrl?: string;
      referenceImageUrl?: string;
      galleryUrls?: string[];
      images?: string[];
      imageUrls?: string[];
    }
  | undefined
  | null;

interface CategoryGridClientProps {
  items: ListItem[];
  categoryType: "place" | "experience" | "service";
  categoryLabel: string;
}

export default function CategoryGridClient({
  items = [],
  categoryType,
  categoryLabel,
}: CategoryGridClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse active filter reactively from URLSearchParams
  const activeFilter = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return FilterService.get(params);
  }, [searchParams]);

  // Filter items by selected location (place)
  const filteredItems = useMemo(() => {
    const searchPlace = activeFilter?.place?.trim().toLowerCase();
    const subCategory = activeFilter?.subCategory?.trim();

    return items.filter((item) => {
      if (!item) return false;
      if (subCategory && item.subCategory !== subCategory) return false;
      if (!searchPlace) return true;
      const nameMatch = item.name?.toLowerCase().includes(searchPlace);
      const addressMatch = item.address?.toLowerCase().includes(searchPlace);
      const descMatch = item.description?.toLowerCase().includes(searchPlace);
      return nameMatch || addressMatch || descMatch;
    });
  }, [items, activeFilter]);

  // Handle new search from the search bar (maintain the current route page context)
  const handleSearchSubmit = (newFilter: Filter) => {
    // Map URL search parameter type correctly ("experience" maps to "exp" query type)
    const queryType = categoryType === "experience" ? "exp" : categoryType;
    const filterWithType = { ...newFilter, type: queryType };
    
    const params = FilterService.set(filterWithType);
    router.push(`/${categoryType}?${params.toString()}`);
  };

  const getUnitSuffix = () => {
    if (categoryType === "place") return "/ đêm";
    if (categoryType === "experience") return "/ nhóm";
    return "/ dịch vụ";
  };

  const getBadgeStyles = () => {
    return "border border-[#DDDDDD] bg-[#F7F7F7] text-[#222222]";
  };

  return (
    <div className="min-h-screen bg-white pb-20 text-[#222222]">
      <div className="h-[70px]" />
      
      <div className="mx-auto max-w-[1760px] px-6 pt-8 md:px-10 xl:px-20">
        {/* Results Info Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-[22px] font-bold leading-[26px] tracking-normal md:text-2xl">
                Danh sách {categoryLabel} {activeFilter?.place ? `tại ${activeFilter.place}` : ""}
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#717171]">
              Hiển thị {filteredItems.length} lựa chọn phù hợp
            </p>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeFilter?.place && (
              <Badge variant="outline" className="rounded-full bg-white px-3 py-1 font-medium">
                <MapPin className="mr-1 h-3.5 w-3.5 text-[#717171]" />
                {activeFilter.place}
              </Badge>
            )}
            {activeFilter?.date?.from && (
              <Badge variant="outline" className="rounded-full bg-white px-3 py-1 font-medium">
                <Calendar className="mr-1 h-3.5 w-3.5 text-[#717171]" />
                {format(new Date(activeFilter.date.from), "dd/MM/yyyy")}
                {activeFilter.date.to && ` - ${format(new Date(activeFilter.date.to), "dd/MM/yyyy")}`}
              </Badge>
            )}
            <Badge className={`px-3 py-1 rounded-full font-bold uppercase tracking-wider ${getBadgeStyles()}`}>
              {categoryLabel}
            </Badge>
          </div>
        </div>

        {/* Results Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filteredItems.map((item, index) => {
              if (!item) return null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListingGridCard
                    item={item}
                    categoryLabel={categoryLabel}
                    unit={getUnitSuffix()}
                    onSelect={() => router.push(`/${categoryType}/${item.id}/detail`)}
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
            className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <div className="bg-white dark:bg-zinc-850 p-4 rounded-full shadow-md mb-4 text-zinc-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-app-fg">Không tìm thấy kết quả nào</h2>
            <p className="text-sm text-app-muted-fg mt-2 max-w-sm px-4">
              Chúng tôi không tìm thấy dịch vụ nào khớp với từ khóa
              &quot;{activeFilter?.place || ""}&quot; tại thời điểm này.
            </p>
            <Button
              className="mt-6 bg-app-primary text-white hover:bg-app-primary/95 font-semibold rounded-xl px-5"
              onClick={() => handleSearchSubmit({ place: "", type: categoryType === "experience" ? "exp" : categoryType })}
            >
              Đặt lại bộ lọc
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
