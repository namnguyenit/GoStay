"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Globe, Heart, Share2, MapPin, Calendar, Check } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatMoney } from "@/shared/utils";

type CategoryItem =
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

interface CategoryDetailScreenProps {
  items: CategoryItem[] | undefined;
  activeId: string;
  categoryType: "place" | "experience" | "service";
}

export default function CategoryDetailScreen({
  items = [],
  activeId,
  categoryType,
}: CategoryDetailScreenProps) {
  const router = useRouter();

  // Find the selected item or default to the first one if not found
  const selectedItem = items.find((item) => item?.id === activeId) || items[0];

  // Helper to get category text suffix
  const getUnitSuffix = () => {
    switch (categoryType) {
      case "place":
        return "/đêm";
      case "experience":
        return "/nhóm";
      case "service":
        return "/dịch vụ";
      default:
        return "";
    }
  };

  // Helper to get label
  const getCategoryLabel = () => {
    switch (categoryType) {
      case "place":
        return "Nơi cư trú";
      case "experience":
        return "Trải nghiệm";
      case "service":
        return "Dịch vụ";
      default:
        return "";
    }
  };

  // Get a simulated host profile picture and details based on the item id hash
  const getHostInfo = (id: string = "") => {
    const avatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    ];
    const names = ["Liza", "Maria", "John", "Sarah", "Alex"];
    const locations = ["Los Angeles", "Đà Lạt", "Hà Nội", "Sài Gòn", "Nha Trang"];

    // Simple hash function to deterministically choose resources
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash += id.charCodeAt(i);
    }

    const index = hash % avatars.length;
    return {
      avatar: avatars[index],
      name: names[index],
      location: locations[index],
    };
  };

  const host = getHostInfo(selectedItem?.id);

  if (!selectedItem) {
    return (
      <div className="center h-[60vh] flex flex-col gap-4">
        <p className="text-app-muted-fg text-lg">Không tìm thấy thông tin chi tiết.</p>
        <Button onClick={() => router.push("/")} variant="outline">
          Quay lại trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-fg pb-16">
      {/* Category Banner Header */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border-b py-4 px-6 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-app-muted-fg">
            <span className="cursor-pointer hover:underline" onClick={() => router.push("/")}>
              Trang chủ
            </span>
            <span>/</span>
            <span className="font-semibold text-app-fg">{getCategoryLabel()}</span>
            <span>/</span>
            <span className="line-clamp-1 max-w-[200px]">{selectedItem?.name}</span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Heart className="h-4 w-4 text-rose-500" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: SELECTED ITEM DETAIL (Col Span 7) */}
          <div className="lg:col-span-7 flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Main rounded image with absolute centered host avatar overlay */}
                <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-md group bg-zinc-100">
                  <img
                    src={selectedItem.image ?? undefined}
                    alt={selectedItem.name}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-103"
                  />
                  {/* Host Avatar Overlapping at the bottom border */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <Avatar className="h-20 w-20 border-4 border-white dark:border-zinc-950 shadow-lg scale-110">
                      <AvatarImage src={host.avatar} alt={host.name} className="object-cover" />
                      <AvatarFallback>{host.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Info Text block */}
                <div className="mt-12 text-center md:text-left">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-app-fg leading-tight">
                    {selectedItem.name}
                  </h1>

                  {/* Auto-translation banner */}
                  <div className="inline-flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-900 border px-3 py-1.5 rounded-full mt-4 text-xs text-app-muted-fg">
                    <Globe className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Được dịch tự động</span>
                  </div>

                  {/* Meta details */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-sm text-app-fg mt-4 font-medium">
                    <div className="flex items-center text-amber-500">
                      <Star className="h-4 w-4 fill-amber-500 mr-1" />
                      <span>{(selectedItem.rating ?? 5.0).toFixed(1)}</span>
                    </div>
                    <span className="text-zinc-300">•</span>
                    <span className="underline text-app-muted-fg">3 đánh giá</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-app-muted-fg">Đầu bếp tại {host.location}</span>
                    <span className="text-zinc-300">•</span>
                    <span className="text-app-muted-fg font-normal">Được cung cấp tại chỗ ở của bạn</span>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-6" />

                  {/* Description */}
                  <div className="text-sm md:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal space-y-4">
                    <p className="whitespace-pre-line">{selectedItem.description || "Chưa có mô tả chi tiết cho mục này. Trải nghiệm dịch vụ cao cấp và tận hưởng không gian tuyệt vời."}</p>
                  </div>

                  {/* Action card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-850 p-6 rounded-3xl shadow-sm mt-8 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1">
                        <span className="text-caption text-xs">Từ</span>
                        <span className="text-xl md:text-2xl font-bold text-[#e61e4d] dark:text-[#ff4e71]">
                          đ{formatMoney(selectedItem.price ?? 0)}
                        </span>
                        <span className="text-caption text-xs font-medium">{getUnitSuffix()}</span>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Hủy miễn phí</span>
                    </div>
                    <Button 
                      className="bg-[#e61e4d] hover:bg-[#d90b3e] text-white font-semibold rounded-2xl px-6 py-5 h-auto transition-transform hover:scale-101 active:scale-99 shadow-sm"
                      onClick={() => alert("Chức năng đặt lịch đang được phát triển.")}
                    >
                      Hiển thị ngày
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SIDE: LIST OF OTHER ITEMS (Col Span 5) */}
          <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-100 dark:border-zinc-800 lg:pl-8 pt-8 lg:pt-0">
            <h2 className="text-lg font-bold text-app-fg mb-4">Các lựa chọn khác</h2>
            
            <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 scrollbar">
              {items.map((item) => {
                if (!item) return null;
                const isActive = item.id === selectedItem.id;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (!isActive) {
                        router.push(`/${categoryType}/${item.id}/detail`);
                      }
                    }}
                    className={`flex gap-4 p-3 rounded-2xl cursor-pointer transition-all border ${
                      isActive
                        ? "bg-zinc-100/80 dark:bg-zinc-800/80 border-[#e61e4d]/40 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-800"
                    }`}
                  >
                    {/* Item Image */}
                    <div className="w-28 h-20 sm:w-32 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-100">
                      <img
                        src={item.image ?? undefined}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Info */}
                    <div className="flex flex-col justify-between flex-grow min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <h3 className="font-bold text-sm sm:text-base text-app-fg line-clamp-1">
                            {item.name}
                          </h3>
                          {isActive && (
                            <span className="flex-shrink-0 bg-[#e61e4d] text-white p-0.5 rounded-full">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-app-muted-fg line-clamp-2 mt-0.5 font-normal">
                          {item.description || "Trải nghiệm sang trọng và đẳng cấp tuyệt vời."}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-baseline gap-0.5">
                          <span className="font-bold text-xs sm:text-sm text-app-fg">
                            đ{formatMoney(item.price ?? 0)}
                          </span>
                          <span className="text-caption text-[10px]">{getUnitSuffix()}</span>
                        </div>
                        <div className="flex items-center text-amber-500 text-xs font-semibold gap-0.5">
                          <Star className="h-3.5 w-3.5 fill-amber-500" />
                          <span>{(item.rating ?? 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
