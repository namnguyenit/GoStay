"use client";

import { createContext, ReactNode } from "react";
import type { Experiences } from "@/modules/experience";
import type { Places } from "@/modules/place";
import type { Services } from "@/modules/service";
import { useHome, UseHome } from "../hooks/useHome";

type HomeProviderProp = {
  children: ReactNode;
  initExperiences: Experiences;
  initPlace: Places;
  initServices: Services;
};

export const HomeContext = createContext<UseHome | null>(null);

export default function HomeProvider({
  children,
  initExperiences,
  initPlace,
  initServices,
}: HomeProviderProp) {
  const home = useHome(initExperiences, initPlace, initServices);

  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
