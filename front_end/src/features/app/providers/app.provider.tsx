"use client";

import { createContext, ReactNode } from "react";
import { useApp, type UseApp } from "../hooks/useApp";

export const AppContext = createContext<UseApp>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const app = useApp();

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
}
