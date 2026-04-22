import { useState } from "react";
import { Experiences } from "@/features/experience";

export const useHome = (initData: Experiences) => {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [clock, setClock] = useState<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [experiences, setExperiences] = useState<Experiences | null>(initData);

  return {
    imageIndex,
    setImageIndex,
    clock,
    setClock,
    experiences,
    setExperiences,
  };
};

export type UseHome = ReturnType<typeof useHome>;
