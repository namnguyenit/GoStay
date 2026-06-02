import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { AppProvider } from "../features/app/providers/app.provider";
import { AuthModalProvider } from "@/shared/context/AuthModalContext";
import AuthModal from "@/shared/components/AuthModal";

export const metadata: Metadata = {
  title: "Go Travel",
  description: "Du lịch không chỉ là đi, mà là thuộc về nơi bạn đến.",
  icons: {
    icon: "/favicon.ico",
  },
};

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <AuthModalProvider>
        <html lang="vi" className={`${fontSans.variable}`}>
          <body className="">
            {children}
            <AuthModal />
          </body>
        </html>
      </AuthModalProvider>
    </AppProvider>
  );
}
