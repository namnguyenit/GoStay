"use client";

import { useRef, useState } from "react";
import type { Experiences } from "@/modules/experience";
import type { Places } from "@/modules/place";
import type { Services } from "@/modules/service";
import type { ComplexOffering } from "@/services/complex";

export type HomeLandmark = {
  id?: string;
  name?: string;
  description?: string;
  province?: string;
  rating?: string | number;
  thumbnailUrl?: string;
  referenceImageUrl?: string;
  galleryUrls?: string[];
};

export const useHome = (
  initExperiences: Experiences,
  initPlace: Places,
  initServices: Services,
  initLandmarks: HomeLandmark[] = [],
  initComplexes: ComplexOffering[] = [],
) => {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const [experiences, setExperiences] = useState<Experiences | null>(
    initExperiences,
  );
  const [places, setPlaces] = useState<Places | null>(initPlace);
  const [services, setServices] = useState<Services | undefined>(initServices);
  const [landmarks, setLandmarks] = useState<HomeLandmark[]>(initLandmarks);
  const [complexes, setComplexes] = useState<ComplexOffering[]>(initComplexes);

  const setClock = (time?: number) => {
    clearInterval(clock.current ?? undefined);

    clock.current = setInterval(() => {
      setImageIndex((prev) => {
        let i = prev + 1;
        const maxLimit = Math.min(landmarks?.length ?? 0, 6);
        if (i >= maxLimit) {
          i = 0;
        }
        return i;
      });
    }, time);
  };

  return {
    imageIndex,
    setImageIndex,
    clock,
    setClock,
    experiences,
    setExperiences,
    places,
    setPlaces,
    services,
    setServices,
    landmarks,
    setLandmarks,
    complexes,
    setComplexes,
  };
};

export type UseHome = ReturnType<typeof useHome>;
