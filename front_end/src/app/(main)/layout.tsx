import { ReactNode, Suspense } from "react";

import MainLayoutClient from "@/features/app/components/MainLayoutClient";
import { CartProvider } from "@/shared/context/CartContext";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <Suspense fallback={null}>
        <MainLayoutClient>{children}</MainLayoutClient>
      </Suspense>
    </CartProvider>
  );
}
