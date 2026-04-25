import { Card } from "@/components/ui/card";
import { CarouselItem } from "@/components/ui/carousel";
import { formatMoney } from "@/shared/utils";
import { Star } from "lucide-react";
import { Place } from "../model";

type PlaceCarouselItemProp = { item: Place; onSelect?: (value: Place) => void };

export default function PlaceCarouselItem({
  item,
  onSelect,
}: PlaceCarouselItemProp) {
  return (
    <CarouselItem
      key={item?.id}
      className="basis-1/2 md:basis-1/3 lg:basis-1/7"
    >
      <Card
        className="aspect-square border-0 p-0 shadow-none ring-0 outline-0 transition-transform hover:scale-98"
        onClick={() => onSelect?.(item)}
      >
        <img
          src={item?.image ?? undefined}
          alt=""
          className="size-full object-cover"
        />
      </Card>
      <div className="p-1">
        <div
          className="text-app-fg line-clamp-1"
          onClick={() => onSelect?.(item)}
        >
          {item?.name}
        </div>
        <div className="center-y line-clamp-1 flex justify-between">
          <div className="center-y gap-1">
            <div className="text-caption underline">đ</div>
            <div className="text-caption line-clamp-1">
              {formatMoney(item?.price ?? 0)}
            </div>
          </div>
          <div className="row center-y gap-0.5">
            <Star className="text-caption line-clamp-1 w-4" />
            <div className="text-caption line-clamp-1">{item?.rating ?? 0}</div>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
