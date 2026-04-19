"use client";

import { createContext, useContext, useState } from "react";
import { ProviderType, ServiceType } from "@/types";

interface ServiceContextInterface {
  serviceData: ServiceType[] | null;
  setServiceData: React.Dispatch<React.SetStateAction<ServiceType[] | null>>;

  imageIndex: number;
  setImageIndex: React.Dispatch<React.SetStateAction<number>>;

  clock: ReturnType<typeof setInterval> | null;
  setClock: React.Dispatch<
    React.SetStateAction<ReturnType<typeof setInterval> | null>
  >;
}

type ServiceContextType = ServiceContextInterface | null;

export const ServiceContext = createContext<ServiceContextType | null>(null);

export default function ServiceProvider({ children, initData }: ProviderType) {
  const [serviceData, setServiceData] = useState<ServiceType[] | null>(
    initData,
  );
  const [imageIndex, setImageIndex] = useState<number>(0);
  const [clock, setClock] = useState<ReturnType<typeof setInterval> | null>(
    null,
  );

  return (
    <ServiceContext.Provider
      value={{
        serviceData,
        setServiceData,
        imageIndex,
        setImageIndex,
        clock,
        setClock,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
}
