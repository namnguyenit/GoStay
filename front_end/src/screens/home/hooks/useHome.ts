"use client";

import { useRef, useState } from "react";
import type { Experiences } from "@/modules/experience";
import type { Places } from "@/modules/place";
import type { Services } from "@/modules/service";

export const useHome = (
  initExperiences: Experiences,
  initPlace: Places,
  initServices: Services,
  initLandmarks: any[] = [],
) => {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const [experiences, setExperiences] = useState<Experiences | null>(
    initExperiences,
  );
  const [places, setPlaces] = useState<Places | null>(initPlace);
  const [services, setServices] = useState<Services | undefined>(initServices);
  const [landmarks, setLandmarks] = useState<any[]>(initLandmarks);

  const setClock = (time?: number) => {
    clearInterval(clock.current ?? undefined);

    clock.current = setInterval(() => {
      setImageIndex((prev: any) => {
        let i = prev + 1;
        if (i >= (experiences?.length ?? 0)) {
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
    services,
    setServices,
    landmarks,
    setLandmarks,
  };
};

export type UseHome = ReturnType<typeof useHome>;
