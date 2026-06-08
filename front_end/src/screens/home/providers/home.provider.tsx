"use client";

import { createContext, ReactNode } from "react";
import type { Experiences } from "@/modules/experience";
import type { Places } from "@/modules/place";
import type { Services } from "@/modules/service";
import { HomeLandmark, useHome, UseHome } from "../hooks/useHome";
import type { ComplexOffering } from "@/services/complex";

type HomeProviderProp = {
  children: ReactNode;
  initExperiences: Experiences;
  initPlace: Places;
  initServices: Services;
  // Giữ lại initLandmarks từ TestSystem
  initLandmarks?: HomeLandmark[];
  initComplexes?: ComplexOffering[];
};

export const HomeContext = createContext<UseHome | undefined>(undefined);

export default function HomeProvider({
  children,
  initExperiences,
  initPlace,
  initServices,
  initLandmarks = [],
  initComplexes = [],
}: HomeProviderProp) {
  const home = useHome(
    initExperiences,
    initPlace,
    initServices,
    initLandmarks,
    initComplexes,
  );

  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
