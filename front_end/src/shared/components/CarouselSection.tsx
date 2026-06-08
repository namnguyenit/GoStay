"use client";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react";
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
    <section className="mx-auto w-full max-w-[1760px] px-6 py-2 md:px-10 xl:px-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-center">
          <h2 className="line-clamp-1 text-[22px] font-bold leading-[26px] text-[#222222]">
            {title}
          </h2>
          <div className="w-2" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-[#F7F7F7] text-[#222222] hover:bg-[#EEEEEE]"
            aria-label={`Xem thêm ${title}`}
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-[#DDDDDD] bg-white text-[#222222] shadow-sm hover:bg-[#F7F7F7] disabled:opacity-35"
            onClick={() => carousel?.scrollPrev()}
            disabled={!canCarouse.canPrev}
            aria-label="Cuộn carousel sang trái"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border-[#DDDDDD] bg-white text-[#222222] shadow-sm hover:bg-[#F7F7F7] disabled:opacity-35"
            onClick={() => carousel?.scrollNext()}
            disabled={!canCarouse.canNext}
            aria-label="Cuộn carousel sang phải"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="h-5" />
      <Carousel
        opts={{
          align: "start",
        }}
        setApi={setCarousel}
        className="w-full"
      >
        <CarouselContent className="-ml-6">{children}</CarouselContent>
      </Carousel>
    </section>
  );
}
