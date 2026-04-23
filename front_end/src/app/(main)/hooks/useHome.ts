import { useState } from "react";
import { Experiences } from "@/features/experience";
import { Places } from "@/features/place";

export const useHome = (initExperiences: Experiences, initPlace: Places) => {
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [clock, setClock] = useState<ReturnType<typeof setInterval> | null>(
    null,
  );
  const [experiences, setExperiences] = useState<Experiences | null>(
    initExperiences,
  );
  const [places, setPlaces] = useState<Places | null>(initPlace);

  return {
    imageIndex,
    setImageIndex,
    clock,
    setClock,
    experiences,
    setExperiences,
    places,
  };
};

export type UseHome = ReturnType<typeof useHome>;
