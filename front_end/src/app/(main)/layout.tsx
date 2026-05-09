import { ReactNode } from "react";

import MainLayoutClient from "@/features/app/components/MainLayoutClient";

export default function Layout({ children }: { children: ReactNode }) {
  return <MainLayoutClient>{children}</MainLayoutClient>;
}
