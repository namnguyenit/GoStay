"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Star, Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { FilterService } from "@/services/filter";
import { SearchInfoSection } from "@/shared/components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/shared/utils";
import { format } from "date-fns";

type ListItem =
  | {
      id?: string;
      name?: string;
      price?: number;
      description?: string;
      address?: string;
      rating?: number;
      image?: string;
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
    if (!searchPlace) return items;

    return items.filter((item) => {
      if (!item) return false;
      const nameMatch = item.name?.toLowerCase().includes(searchPlace);
      const addressMatch = item.address?.toLowerCase().includes(searchPlace);
      const descMatch = item.description?.toLowerCase().includes(searchPlace);
      return nameMatch || addressMatch || descMatch;
    });
  }, [items, activeFilter]);

  // Handle new search from the search bar (maintain the current route page context)
  const handleSearchSubmit = (newFilter: any) => {
    // Map URL search parameter type correctly ("experience" maps to "exp" query type)
    const queryType = categoryType === "experience" ? "exp" : categoryType;
    const filterWithType = { ...newFilter, type: queryType };
    
    const params = FilterService.set(filterWithType);
    router.push(`/${categoryType}?${params.toString()}`);
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
    <div className="min-h-screen bg-app-bg text-app-fg pb-20">
      <div className="h-[70]" />
      
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        {/* Results Info Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                Danh sách {categoryLabel} {activeFilter?.place ? `tại ${activeFilter.place}` : ""}
              </h1>
            </div>
            <p className="text-sm text-app-muted-fg mt-1">
              Hiển thị {filteredItems.length} lựa chọn phù hợp
            </p>
          </div>

          {/* Active Filters Display */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {activeFilter?.place && (
              <Badge variant="outline" className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full font-medium">
                <MapPin className="h-3.5 w-3.5 mr-1 text-app-muted-fg" />
                {activeFilter.place}
              </Badge>
            )}
            {activeFilter?.date?.from && (
              <Badge variant="outline" className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900 rounded-full font-medium">
                <Calendar className="h-3.5 w-3.5 mr-1 text-app-muted-fg" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => {
              if (!item) return null;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    onClick={() => router.push(`/${categoryType}/${item.id}/detail`)}
                    className="group border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 bg-app-card hover:border-zinc-200 dark:hover:border-zinc-700 flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                      <img
                        src={item.image ?? undefined}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                      />
                      <Badge
                        className={`absolute top-4 left-4 z-10 px-3 py-1 shadow-sm font-bold uppercase tracking-wider text-[10px] rounded-full ${getBadgeStyles()}`}
                      >
                        {categoryLabel}
                      </Badge>
                    </div>

                    {/* Content Area */}
                    <CardContent className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="font-bold text-sm sm:text-base text-app-fg line-clamp-1 group-hover:text-app-primary transition-colors duration-300">
                          {item.name}
                        </h3>

                        {/* Location */}
                        <div className="flex items-center text-xs text-app-muted-fg mt-1 gap-1">
                          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
                          <span className="line-clamp-1">{item.address || "Việt Nam"}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-app-muted-fg mt-2 line-clamp-2 leading-relaxed font-normal">
                          {item.description || "Trải nghiệm dịch vụ cao cấp và tận hưởng không gian tuyệt vời."}
                        </p>
                      </div>

                      {/* Pricing and Rating */}
                      <div className="flex items-center justify-between border-t pt-3 mt-4">
                        <div className="flex items-baseline">
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm sm:text-base">
                            đ{formatMoney(item.price ?? 0)}
                          </span>
                          <span className="text-app-muted-fg text-[10px] sm:text-xs font-light ml-0.5">
                            {getUnitSuffix()}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs sm:text-sm">
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
            className="flex flex-col items-center justify-center py-20 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800"
          >
            <div className="bg-white dark:bg-zinc-850 p-4 rounded-full shadow-md mb-4 text-zinc-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-app-fg">Không tìm thấy kết quả nào</h2>
            <p className="text-sm text-app-muted-fg mt-2 max-w-sm px-4">
              Chúng tôi không tìm thấy dịch vụ nào khớp với từ khóa "
              {activeFilter?.place || ""}" tại thời điểm này.
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
