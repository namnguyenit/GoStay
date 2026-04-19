"use client";

import { createContext, useState } from "react";

function greet(name: string = "mdf") {
  console.log(name);
}

interface HomeContextInterface {
  count: number | null;
  setCount: React.Dispatch<React.SetStateAction<number | null>>;
}
type HomeContextType = HomeContextInterface | null;

export const HomeContext = createContext<HomeContextType>(null);

export default function HomeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [count, setCount] = useState<number | null>(null);

  return (
    <HomeContext.Provider value={{ count, setCount }}>
      {children}
    </HomeContext.Provider>
  );
}
