"use client";

import { createContext, ReactNode } from "react";
import { Experiences } from "@/features/experience";
import { Places } from "@/features/place";
import { useHome, UseHome } from "../hooks/useHome";

type HomeProviderProp = {
  children: ReactNode;
  initExperiences: Experiences;
  initPlace: Places;
};

export const HomeContext = createContext<UseHome | null>(null);

export default function HomeProvider({
  children,
  initExperiences,
  initPlace,
}: HomeProviderProp) {
  const home = useHome(initExperiences, initPlace);
  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
