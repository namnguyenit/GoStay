"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import ImageNavigation from "./ImageNavigation";
import { useSafeContext } from "@/shared/hooks";
import { HomeContext } from "../providers/home.provider";
import { CarouselSection, SearchInfoSection } from "@/shared/components";
import { OfferingCarouselItem } from "@/shared/components";
import { AppContext } from "@/features/app/providers/app.provider";
import { FilterService } from "@/services/filter";

export default function HomeClient() {
  const router = useRouter();
  // Giữ landmarks từ TestSystem cho background
  const { imageIndex, clock, setClock, experiences, places, services, landmarks } =
    useSafeContext(HomeContext);

  const { filter } = useSafeContext(AppContext);

  useEffect(() => {
    setClock(6000);
    return () => {
      clearInterval(clock.current ?? undefined);
    };
  }, []);

  const itemRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="center relative size-full">
        {/* BG — giữ landmarks làm background như TestSystem */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="size-full scale-115 bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={landmarks?.[imageIndex]?.id}
                initial={{ opacity: 0, x: "5%" }}
                animate={{ opacity: [0, 1, 1], x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeIn" }}
                className="size-full"
              >
                <img
                  src={landmarks?.[imageIndex]?.thumbnailUrl ?? undefined}
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
          {/* INFO — giữ thông tin landmark từ TestSystem */}
          <div className="pos-center-y">
            <motion.div
              key={landmarks?.[imageIndex]?.id}
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              className="w-full"
            >
              <div>
                <div className="text-header text-white">
                  {landmarks?.[imageIndex]?.name}
                </div>
                <div className="text-content text-white mt-2 max-w-2xl line-clamp-2">{landmarks?.[imageIndex]?.description}</div>
                <div className="text-content text-white mt-1 font-medium">{landmarks?.[imageIndex]?.province}</div>
                <div className="h-[20]" />
                <Button
                  className="text-title bg-app-primary hover:bg-app-accent w-[200]"
                  onClick={() => {
                    const activeLandmark = landmarks?.[imageIndex];
                    if (activeLandmark?.id) {
                      router.push(`/landmark/${activeLandmark.id}/detail`);
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
        {/* Search Info — cải tiến từ frontend với FilterService */}
        <div className="pos-center-x bottom-[-30] w-6/10">
          <Suspense fallback={<div className="h-[70] w-full rounded-full bg-white dark:bg-zinc-900 border animate-pulse" />}>
            <SearchInfoSection
              onClickSearch={(value) => {
                const params = FilterService.set(value);
                router.push(`/search?${params.toString()}`);
              }}
              filter={filter}
            />
          </Suspense>
        </div>
      </div>
      <div className="h-18" />
      {/* Carousels — layout mới từ frontend (gọn hơn) */}
      <CarouselSection title="Dịch vụ">
        {services?.map((e) => (
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
        {places?.map((e) => (
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
        {experiences?.map((e) => (
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
