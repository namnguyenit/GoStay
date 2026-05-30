"use client";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, MoveRight, Star } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import type { EmblaCarouselType } from "embla-carousel";

export default function CarouselSection({
  children,
  title,
}: {
  title: string;
  children: ReactNode;
}) {
  const [carousel, setCarousel] = useState<EmblaCarouselType | undefined>(
    undefined,
  );
  const [canCarouse, setCanCarouse] = useState({
    canPrev: false,
    canNext: true,
  });

  useEffect(() => {
    if (!carousel) return;
    const update = () => {
      setCanCarouse({
        canPrev: carousel.canScrollPrev(),
        canNext: carousel.canScrollNext(),
      });
    };
    update();
    carousel.on("select", update); // khi scroll
    carousel.on("reInit", update); // khi reset
    return () => {
      carousel.off("select", update);
      carousel.off("reInit", update);
    };
  }, [carousel]);

  return (
    <div className="px-4">
      <div className="row justify-between">
        <div className="center-y flex-1">
          <div className="text-title line-clamp-1">{title}</div>
          <div className="w-2" />
          <Button className="bg-app-muted hover:bg-app-accent flex aspect-square h-auto items-center justify-center rounded-full border-0 p-0">
            <MoveRight className="text-app-fg size-7 p-2" />
          </Button>
        </div>
        <div>
          <Button
            className="bg-app-muted hover:bg-app-accent"
            onClick={() => carousel?.scrollPrev()}
            disabled={!canCarouse.canPrev}
          >
            <ChevronLeft className="text-app-muted-fg" />
          </Button>
          <Button
            className="bg-app-muted hover:bg-app-accent"
            onClick={() => carousel?.scrollNext()}
            disabled={!canCarouse.canNext}
          >
            <ChevronRight className="text-app-muted-fg" />
          </Button>
        </div>
      </div>
      <div className="h-4" />
      <Carousel
        opts={{
          align: "start",
        }}
        setApi={setCarousel}
        className="w-full"
      >
        <CarouselContent>{children}</CarouselContent>
      </Carousel>
    </div>
  );
}
