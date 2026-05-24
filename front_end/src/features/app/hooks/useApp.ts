"use client";

import { useState } from "react";

export const TAB = {
  PLACE: "place",
  EXPERIENCE: "experience",
  SERVICE: "service",
} as const;

export type Tab = (typeof TAB)[keyof typeof TAB];

export const isTab = (value: string): value is Tab => {
  return Object.values(TAB).includes(value as Tab);
};

export const useApp = () => {
  const [tab, setTab] = useState<Tab>();

  return { tab, setTab };
};

export type UseApp = ReturnType<typeof useApp> | undefined;
