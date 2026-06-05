"use client";

import { useEffect, Suspense } from "react";
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

type HomeOffering = {
  id?: string;
  name?: string;
  price?: number;
  description?: string;
  address?: string;
  rating?: number;
  image?: string;
};

type LandmarkOffering = HomeOffering & {
  province?: string;
  thumbnailUrl?: string;
  referenceImageUrl?: string;
};

export default function HomeClient() {
  const router = useRouter();
  // Giữ landmarks từ TestSystem cho background
  const { imageIndex, clock, setClock, experiences, places, services, landmarks } =
    useSafeContext(HomeContext);

  const { filter } = useSafeContext(AppContext);

  useEffect(() => {
    setClock(6000);
    const activeClock = clock.current;
    return () => {
      clearInterval(activeClock ?? undefined);
    };
  }, [clock, setClock]);

  const landmarkList = (landmarks ?? []) as LandmarkOffering[];
  const placeList = (places ?? []) as HomeOffering[];
  const experienceList = (experiences ?? []) as HomeOffering[];
  const serviceList = (services ?? []) as HomeOffering[];

  const rankProvinceGroups = (groups: Record<string, HomeOffering[]>) => {
    return Object.entries(groups)
      .map(([name, list]) => {
        // Filter out unrated listings (those with rating === 0 or undefined)
        const ratedListings = list.filter((x) => x.rating && x.rating > 0);
        
        let score = 0;
        if (ratedListings.length > 0) {
          // Has rated listings: weight average rating heavily + count of rated listings
          const avgRating = ratedListings.reduce((sum, x) => sum + (x.rating ?? 0), 0) / ratedListings.length;
          const count = ratedListings.length;
          score = 100000 + (avgRating * 100) + count;
        } else {
          // Unrated-only listings: prioritize based on sheer listing count
          score = list.length;
        }

        // Sort items in this province by rating descending
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        return { name, list, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  // 2. Top 3 địa điểm có khách sạn ưa chuộng
  const groupPlacesByProvince = (placesList: HomeOffering[]) => {
    if (!placesList) return [];
    const groups: Record<string, HomeOffering[]> = {};
    placesList.forEach(p => {
      const parts = p.address?.split(",") || [];
      const province = (parts[parts.length - 1] || p.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(p);
    });
    
    return rankProvinceGroups(groups);
  };
  const topProvinces = groupPlacesByProvince(placeList);

  // 3. Top 3 các trải nghiệm ưa chuộng
  const groupExperiencesByProvince = (expList: HomeOffering[]) => {
    if (!expList) return [];
    const groups: Record<string, HomeOffering[]> = {};
    expList.forEach(e => {
      const parts = e.address?.split(",") || [];
      const province = (parts[parts.length - 1] || e.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(e);
    });
    
    return rankProvinceGroups(groups);
  };
  const topExpGroups = groupExperiencesByProvince(experienceList);

  // 4. Top 3 các dịch vụ ưa chuộng
  const groupServicesByProvince = (svcList: HomeOffering[]) => {
    if (!svcList) return [];
    const groups: Record<string, HomeOffering[]> = {};
    svcList.forEach(s => {
      const parts = s.address?.split(",") || [];
      const province = (parts[parts.length - 1] || s.address || "Việt Nam").trim();
      if (!groups[province]) groups[province] = [];
      groups[province].push(s);
    });
    
    return rankProvinceGroups(groups);
  };
  const topSvcGroups = groupServicesByProvince(serviceList);

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
        <div className="absolute inset-0 pointer-events-none">
          {/* Lớp phủ gradient tối phần trên cùng (navbar area) */}
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
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

      {/* Top Địa Danh Nổi Tiếng */}
      {landmarkList.length > 0 && (
        <>
          <CarouselSection title="Địa danh nổi bật">
            {landmarkList.map((lm) => (
              <OfferingCarouselItem
                key={lm?.id}
                item={{
                  id: lm?.id,
                  name: lm?.name,
                  image: lm?.thumbnailUrl || lm?.referenceImageUrl,
                  description: lm?.description,
                }}
                onSelect={(item) => {
                  if (item?.id) router.push(`/landmark/${item.id}/detail`);
                }}
                unit="/ đêm"
              />
            ))}
          </CarouselSection>
          <div className="h-10" />
        </>
      )}

      {/* Top 3 locations with popular hotels */}
      {topProvinces.length > 0 && (
        <>
          {topProvinces.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Khách sạn tại ${group.name}`}>
                {group.list.map((e) => (
                  <OfferingCarouselItem
                    key={e?.id}
                    item={e}
                    onSelect={(item) => {
                      if (item?.id) router.push(`/place/${item.id}/detail`);
                    }}
                    unit="/ đêm"
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
          {topExpGroups.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Trải nghiệm tại ${group.name}`}>
                {group.list.map((e) => (
                  <OfferingCarouselItem
                    key={e?.id}
                    item={e}
                    onSelect={(item) => {
                      if (item?.id) router.push(`/experience/${item.id}/detail`);
                    }}
                    unit="/ nhóm"
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
          {topSvcGroups.map((group) => (
            <div key={group.name}>
              <CarouselSection title={`Dịch vụ tại ${group.name}`}>
                {group.list.map((e) => (
                  <OfferingCarouselItem
                    key={e?.id}
                    item={e}
                    onSelect={(item) => {
                      if (item?.id) router.push(`/service/${item.id}/detail`);
                    }}
                    unit="/ dịch vụ"
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
