"use client";

import { Home, Compass, ConciergeBell } from "lucide-react";
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
      label: "Nơi cư trú",
      icon: Home,
    },
    {
      id: "exp" as CategoryType,
      label: "Trải nghiệm",
      icon: Compass,
    },
    {
      id: "service" as CategoryType,
      label: "Dịch vụ",
      icon: ConciergeBell,
    },
  ];

  return (
    <div className="flex items-center justify-center gap-8 md:gap-12 py-3 border-b border-zinc-100 dark:border-zinc-800 w-full max-w-xl mx-auto">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = value === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 pb-2.5 cursor-pointer relative group transition-colors duration-200 focus:outline-none border-b-2",
              isActive
                ? "border-app-primary text-app-primary dark:border-app-primary dark:text-app-primary"
                : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            )}
          >
            <Icon
              className={cn(
                "h-6 w-6 transition-transform duration-300 group-hover:scale-105",
                isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"
              )}
            />
            <span
              className={cn(
                "text-xs font-semibold tracking-wide transition-all duration-200",
                isActive ? "opacity-100" : "opacity-85"
              )}
            >
              {cat.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
