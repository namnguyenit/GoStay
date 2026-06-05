"use client";

import { formatMoney } from "@/shared/utils";
import { ChevronLeft, ChevronRight, Heart, Star } from "lucide-react";
import { useState } from "react";

type ListingGridCardItem = {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  address?: string;
  rating?: number;
  image?: string;
};

type ListingGridCardProps = {
  item: ListingGridCardItem;
  categoryLabel: string;
  unit: string;
  onSelect: () => void;
};

export default function ListingGridCard({
  item,
  categoryLabel,
  unit,
  onSelect,
}: ListingGridCardProps) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="group flex h-full cursor-pointer flex-col">
      <div
        className="relative aspect-[20/19] overflow-hidden rounded-xl bg-[#F7F7F7]"
        onClick={onSelect}
      >
        <img
          src={item.image}
          alt={item.name || "Hình ảnh dịch vụ"}
          className="h-full w-full object-cover transition-[filter] duration-200 group-hover:contrast-105"
          loading="lazy"
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setLiked((value) => !value);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={liked ? "Bỏ khỏi danh sách yêu thích" : "Thêm vào danh sách yêu thích"}
        >
          <Heart
            className="h-6 w-6 drop-shadow"
            fill={liked ? "#FF385C" : "rgba(0,0,0,0.28)"}
            stroke="white"
            strokeWidth={2}
          />
        </button>

        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="absolute left-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#222222] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
          aria-label="Hình ảnh trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(event) => event.stopPropagation()}
          className="absolute right-3 top-1/2 hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-black/5 bg-white/90 text-[#222222] opacity-0 shadow-sm transition-opacity group-hover:opacity-100 md:flex"
          aria-label="Hình ảnh tiếp theo"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/65" />
          <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3
            className="line-clamp-1 text-[15px] font-semibold leading-[19px] text-[#222222]"
            onClick={onSelect}
          >
            {item.name || "Dịch vụ GoStay"}
          </h3>
          <div className="flex shrink-0 items-center gap-1 text-sm leading-[18px] text-[#222222]">
            <Star className="h-3.5 w-3.5 fill-[#222222] text-[#222222]" />
            <span>{Number(item.rating ?? 5).toFixed(1).replace(".", ",")}</span>
          </div>
        </div>

        <p className="line-clamp-1 text-[15px] font-normal leading-[19px] text-[#717171]">
          {item.address || "Việt Nam"}
        </p>
        <p className="line-clamp-1 text-[15px] font-normal leading-[19px] text-[#717171]">
          {categoryLabel} được khách yêu thích
        </p>
        <p className="line-clamp-1 text-[15px] leading-[19px] text-[#222222]">
          <span className="font-semibold">
            {formatMoney(item.price ?? 0)} ₫
          </span>
          <span className="font-normal"> {unit}</span>
        </p>
      </div>
    </article>
  );
}
