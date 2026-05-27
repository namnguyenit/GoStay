"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import ImageNavigation from "./ImageNavigation";
import { useSafeContext } from "@/shared/hooks";
import { HomeContext } from "../providers/home.provider";
import { CarouselSection, SearchInfoSection } from "@/shared/components";
import { OfferingCarouselItem } from "@/shared/components";

export default function HomeClient() {
  const { imageIndex, clock, setClock, experiences, places, services } =
    useSafeContext(HomeContext);

  useEffect(() => {
    setClock(6000);
    return () => {
      clearInterval(clock.current ?? undefined);
    };
  }, []);

  const itemRef = useRef<HTMLDivElement>(null);
  // useEffect(() => {
  //   itemRef.current?.scrollIntoView({
  //     behavior: "smooth",
  //     block: "center", // hoặc "center"
  //   });
  // }, []);

  return (
    <>
      <div className="center relative size-full">
        {/* BG */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="size-full scale-115 bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={experiences?.[imageIndex]?.id}
                initial={{ opacity: 0, x: "5%" }}
                animate={{ opacity: [0, 1, 1], x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="size-full"
              >
                <img
                  src={experiences?.[imageIndex]?.image ?? undefined}
                  alt=""
                  className="size-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {/* Overlay */}
        <div className="absolute inset-0">
          <div className="blur-bottom size-full" />
        </div>
        {/* FG */}
        <div className="relative h-full w-18/19">
          {/* INFO */}
          <div className="pos-center-y">
            <motion.div
              key={experiences?.[imageIndex]?.id}
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              className="w-full"
            >
              <div>
                <div className="text-header text-white">
                  {experiences?.[imageIndex]?.name}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.price}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.address}
                </div>
                <div className="text-content text-white">
                  {experiences?.[imageIndex]?.rating}
                </div>
                <div className="h-[20]" />
                <Button className="text-title bg-app-primary hover:bg-app-accent w-[200]">
                  Xem chi tiết
                </Button>
              </div>
            </motion.div>
          </div>
          <div className="absolute right-0 bottom-1/6 w-full">
            <ImageNavigation />
          </div>
        </div>
        {/* Search Info */}
        <div className="pos-center-x bottom-[-30] w-6/10">
          <SearchInfoSection onClickSearch={console.log} />
        </div>
      </div>
      <div className="h-18" />
      {/* 4 place famous place */}
      <div className="px-4 text-title">Top 4 địa danh nổi tiếng</div>
      <div className="h-10" />
      <CarouselSection title="Khách sạn ưa chuộng">
        {places?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Khách sạn ưa chuộng">
        {places?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Khách sạn ưa chuộng">
        {places?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Khách sạn ưa chuộng">
        {places?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      {/* 
        4 service
      */}
      <div className="px-4 text-title">Top 3 địa điểm có khách sạn ưa chuộng</div>
      <CarouselSection title="Dịch vụ">
        {services?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10"></div>
      <CarouselSection title="Dịch vụ">
        {services?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10"></div>
      <CarouselSection title="Dịch vụ">
        {services?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <div className="px-4 text-title">Top 3 các trải nghiệm ưa chuộng </div>
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <div className="px-4 text-title">Top 3 các dịch vụ ưa chuộng</div>
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem key={e?.id} item={e} onSelect={console.log} />
        ))}
      </CarouselSection>
      <div className="h-10" />
    </>
  );
}
