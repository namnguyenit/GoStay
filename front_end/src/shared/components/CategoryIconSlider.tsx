"use client";

import { ChevronLeft, ChevronRight, ConciergeBell, Home, PartyPopper } from "lucide-react";
import { cn } from "@/lib/utils";

export type CategoryType = "place" | "exp" | "service";

interface CategoryIconSliderProps {
  value: CategoryType;
  onChange: (value: CategoryType) => void;
}

export default function CategoryIconSlider({
  value,
  onChange,
}: CategoryIconSliderProps) {
  const categories = [
    {
      id: "place" as CategoryType,
      label: "Nơi lưu trú",
      icon: Home,
    },
    {
      id: "exp" as CategoryType,
      label: "Trải nghiệm",
      icon: PartyPopper,
    },
    {
      id: "service" as CategoryType,
      label: "Dịch vụ",
      icon: ConciergeBell,
    },
  ];

  return (
    <nav
      className="sticky top-20 z-40 w-full border-b border-[#EAEAEA] bg-white"
      aria-label="Danh mục"
    >
      <div className="mx-auto flex h-[78px] max-w-[1760px] items-center gap-4 px-6 md:px-10 xl:px-20">
        <button
          type="button"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-sm md:flex"
          aria-label="Danh mục trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="no-scrollbar flex flex-1 items-center gap-8 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = value === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={cn(
                  "group relative flex h-[58px] min-w-[76px] flex-col items-center justify-center gap-1.5 text-[#717171] opacity-70 transition hover:text-[#222222] hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#222222]",
                  isActive && "font-semibold text-[#222222] opacity-100"
                )}
              >
                <Icon className="h-6 w-6 stroke-[1.8px]" />
                <span className="whitespace-nowrap text-xs font-semibold leading-4">
                  {cat.label}
                </span>
                <span
                  className={cn(
                    "absolute bottom-0 h-0.5 w-full rounded-full bg-[#222222] transition-opacity",
                    isActive ? "opacity-100" : "opacity-0"
                  )}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#DDDDDD] bg-white text-[#222222] shadow-sm md:flex"
          aria-label="Danh mục tiếp theo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
