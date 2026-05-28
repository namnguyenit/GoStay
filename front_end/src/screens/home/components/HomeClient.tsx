"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import ImageNavigation from "./ImageNavigation";
import { useSafeContext } from "@/shared/hooks";
import { HomeContext } from "../providers/home.provider";
import { CarouselSection, SearchInfoSection } from "@/shared/components";
import { OfferingCarouselItem } from "@/shared/components";
import { AppContext } from "@/features/app/providers/app.provider";

import type { Type } from "@/shared/components/SearchInfoSection";
import { FilterService } from "@/services/filter";

export default function HomeClient() {
  const router = useRouter();
  const { imageIndex, clock, setClock, experiences, places, services } =
    useSafeContext(HomeContext);

  const { filter } = useSafeContext(AppContext);

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
                <Button
                  className="text-title bg-app-primary hover:bg-app-accent w-[200]"
                  onClick={() => {
                    const activeExp = experiences?.[imageIndex];
                    if (activeExp?.id) {
                      router.push(`/experience/${activeExp.id}/detail`);
                    }
                  }}
                >
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
          <SearchInfoSection
            onClickSearch={(value) => {
              const params = FilterService.set(value);

              router.push(
                (() => {
                  switch (value?.type as Type) {
                    case "place":
                      return `/place/?${params.toString()}`;
                    case "exp":
                      return `/experience/?${params.toString()}`;
                    case "service":
                      return `/service/?${params.toString()}`;
                    default:
                      return "";
                  }
                })(),
              );
            }}
            filter={filter}
          />
        </div>
      </div>
      <div className="h-18" />
      <CarouselSection title="Dịch vụ">
        {services?.map((e, index) => (
          <OfferingCarouselItem
            key={e?.id}
            item={e}
            onSelect={(item) => {
              if (item?.id) router.push(`/service/${item.id}/detail`);
            }}
          />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Khách sạn ưa chuộng">
        {places?.map((e, index) => (
          <OfferingCarouselItem
            key={e?.id}
            item={e}
            onSelect={(item) => {
              if (item?.id) router.push(`/place/${item.id}/detail`);
            }}
          />
        ))}
      </CarouselSection>
      <div className="h-10" />
      <CarouselSection title="Trải nghiệm">
        {experiences?.map((e, index) => (
          <OfferingCarouselItem
            key={e?.id}
            item={e}
            onSelect={(item) => {
              if (item?.id) router.push(`/experience/${item.id}/detail`);
            }}
          />
        ))}
      </CarouselSection>
      <div className="h-10" />
    </>
  );
}
