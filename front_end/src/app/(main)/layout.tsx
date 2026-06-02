import { ReactNode } from "react";

import MainLayoutClient from "@/features/app/components/MainLayoutClient";
import { CartProvider } from "@/shared/context/CartContext";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <MainLayoutClient>{children}</MainLayoutClient>
    </CartProvider>
  );
}
