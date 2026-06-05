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
  const home = useHome(initExperiences, initPlace, initServices, initLandmarks);

  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
