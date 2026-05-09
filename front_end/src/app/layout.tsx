import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "@/styles/globals.css";
import { AppProvider } from "../features/app/providers/app.provider";

export const metadata: Metadata = {
  title: "Go Travel",
  description: "Du lịch không chỉ là đi, mà là thuộc về nơi bạn đến.",
  icons: {
    icon: "/favicon.ico",
  },
};

const fontSans = Merriweather({
  variable: "--font-sans",
  weight: "variable",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <html lang="vi" className={`${fontSans.variable}`}>
        <body className="">{children}</body>
      </html>
    </AppProvider>
  );
}
