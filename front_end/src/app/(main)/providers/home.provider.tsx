"use client";

import { createContext, ReactNode } from "react";
import { Experiences } from "@/features/experience";
import { useHome, UseHome } from "../hooks/useHome";

type HomeProviderProp = {
  children: ReactNode;
  initExperiences: Experiences;
};

export const HomeContext = createContext<UseHome | null>(null);

export default function HomeProvider({
  children,
  initExperiences,
}: HomeProviderProp) {
  const home = useHome(initExperiences);
  return <HomeContext.Provider value={home}>{children}</HomeContext.Provider>;
}
