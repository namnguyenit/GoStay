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

export default function HomeClient() {
  const router = useRouter();
  const { imageIndex, clock, setClock, experiences, places, services, landmarks } =
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

  // 1. Top 4 địa danh nổi tiếng (Lấy danh sách landmark có khách sạn)
  const getPlacesForLandmark = (landmark: any) => {
    if (!places) return [];
    return places.filter((p: any) => 
      p.address?.toLowerCase().includes(landmark.province?.toLowerCase()) ||
      p.address?.toLowerCase().includes(landmark.name?.toLowerCase())
    );
  };
  const landmarkCarousels = (landmarks ?? [])
    .map((landmark: any) => ({
      ...landmark,
      list: getPlacesForLandmark(landmark)
    }))
    .filter((c: any) => c.list.length > 0)
    .slice(0, 4);

  // 2. Top 3 địa điểm có khách sạn ưa chuộng
  const groupPlacesByProvince = (placesList: any[]) => {
    if (!placesList) return [];
    const groups: Record<string, any[]> = {};
    placesList.forEach(p => {
      const parts = p.address?.split(",") || [];
      const province = (parts[parts.length - 1] || p.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(p);
    });
    
    return Object.entries(groups)
      .map(([name, list]) => {
        const maxRating = Math.max(...list.map(x => x.rating || 0));
        return { name, list, maxRating };
      })
      .sort((a, b) => b.maxRating - a.maxRating)
      .slice(0, 3);
  };
  const topProvinces = groupPlacesByProvince(places ?? []);

  // 3. Top 3 các trải nghiệm ưa chuộng
  const groupExperiencesByProvince = (expList: any[]) => {
    if (!expList) return [];
    const groups: Record<string, any[]> = {};
    expList.forEach(e => {
      const parts = e.address?.split(",") || [];
      const province = (parts[parts.length - 1] || e.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(e);
    });
    
    return Object.entries(groups)
      .map(([name, list]) => {
        const maxRating = Math.max(...list.map(x => x.rating || 0));
        return { name, list, maxRating };
      })
      .sort((a, b) => b.maxRating - a.maxRating)
      .slice(0, 3);
  };
  const topExpGroups = groupExperiencesByProvince(experiences ?? []);

  // 4. Top 3 các dịch vụ ưa chuộng
  const groupServicesByProvince = (svcList: any[]) => {
    if (!svcList) return [];
    const groups: Record<string, any[]> = {};
    svcList.forEach(s => {
      const parts = s.address?.split(",") || [];
      const province = (parts[parts.length - 1] || s.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(s);
    });
    
    return Object.entries(groups)
      .map(([name, list]) => {
        const maxRating = Math.max(...list.map(x => x.rating || 0));
        return { name, list, maxRating };
      })
      .sort((a, b) => b.maxRating - a.maxRating)
      .slice(0, 3);
  };
  const topSvcGroups = groupServicesByProvince(services ?? []);

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
          <SearchInfoSection onClickSearch={console.log} />
        </div>
      </div>
      <div className="h-18" />
      {/* 4 famous places */}
      {landmarkCarousels.length > 0 && (
        <>
          <div className="px-4 text-title">Top 4 địa danh nổi tiếng</div>
          <div className="h-10" />
          {landmarkCarousels.map((carousel) => (
            <div key={carousel.id}>
              <CarouselSection title={`Khách sạn tại ${carousel.name}`}>
                {carousel.list.map((e: any) => (
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
            </div>
          ))}
        </>
      )}

      {/* Top 3 locations with popular hotels */}
      {topProvinces.length > 0 && (
        <>
          <div className="px-4 text-title">Top 3 địa điểm có khách sạn ưa chuộng</div>
          <div className="h-10" />
          {topProvinces.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Khách sạn tại ${group.name}`}>
                {group.list.map((e: any) => (
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
            </div>
          ))}
        </>
      )}

      {/* Top 3 popular experiences */}
      {topExpGroups.length > 0 && (
        <>
          <div className="px-4 text-title">Top 3 các trải nghiệm ưa chuộng</div>
          <div className="h-10" />
          {topExpGroups.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Trải nghiệm tại ${group.name}`}>
                {group.list.map((e: any) => (
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
            </div>
          ))}
        </>
      )}

      {/* Top 3 popular services */}
      {topSvcGroups.length > 0 && (
        <>
          <div className="px-4 text-title">Top 3 các dịch vụ ưa chuộng</div>
          <div className="h-10" />
          {topSvcGroups.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Dịch vụ tại ${group.name}`}>
                {group.list.map((e: any) => (
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
            </div>
          ))}
        </>
      )}
    </>
  );
}
