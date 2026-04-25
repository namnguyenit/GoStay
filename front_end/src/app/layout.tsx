import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "@/styles/globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${fontSans.variable}`}>
      <body className="app-dark">{children}</body>
    </html>
  );
}
