"use client";

import { createContext, ReactNode } from "react";
import type { Experiences } from "@/modules/experience";
import type { Places } from "@/modules/place";
import type { Services } from "@/modules/service";
import { useHome, UseHome } from "../hooks/useHome";
import type { Filter } from "@/modules/filter";
import { FilterService } from "@/services/filter";

type HomeProviderProp = {
  children: ReactNode;
  initExperiences: Experiences;
  initPlace: Places;
  initServices: Services;
  // Giữ lại initLandmarks từ TestSystem
  initLandmarks?: any[];
};

export const HomeContext = createContext<UseHome | undefined>(undefined);

export default function HomeProvider({
  children,
  initExperiences,
  initPlace,
  initServices,
  initLandmarks = [],
}: HomeProviderProp) {
  const getListingsCountForLandmark = (landmark: any) => {
    let count = 0;
    const lmProvince = landmark.province?.toLowerCase();
    const lmName = landmark.name?.toLowerCase();

    if (initPlace) {
      count += initPlace.filter((p: any) => 
        (lmProvince && p.address?.toLowerCase().includes(lmProvince)) ||
        (lmName && p.address?.toLowerCase().includes(lmName))
      ).length;
    }
    if (initExperiences) {
      count += initExperiences.filter((e: any) => 
        (lmProvince && e.address?.toLowerCase().includes(lmProvince)) ||
        (lmName && e.address?.toLowerCase().includes(lmName))
      ).length;
    }
    if (initServices) {
      count += initServices.filter((s: any) => 
        (lmProvince && s.address?.toLowerCase().includes(lmProvince)) ||
        (lmName && s.address?.toLowerCase().includes(lmName))
      ).length;
    }
    return count;
  };

  const sortedLandmarks = [...initLandmarks]
    .map(lm => ({
      ...lm,
      listingsCount: getListingsCountForLandmark(lm)
    }))
    .sort((a, b) => b.listingsCount - a.listingsCount);

  const home = useHome(initExperiences, initPlace, initServices, sortedLandmarks);

  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
