import type { Metadata } from "next";
import { Merriweather } from "next/font/google";
import "@/styles/globals.css";
import ServerApi from "@/services/api.service";
import { ServiceSchema } from "@/types";
import z from "zod";

export const metadata: Metadata = {
  title: "Go Travel",
  description: "Du lịch không chỉ là đi , mà là thuộc về nơi bạn đến.",
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
  const res = await ServerApi.get(
    "http://localhost:3001/api/service",
    z.array(ServiceSchema),
  );

  // const res = await fetchApi(
  //   "http://localhost:3001/api/service",
  //   ServicesSchema,
  // );

  // console.log("#--------------");
  // console.log(res);

  // console.log(typeof );

  return (
    <html lang="vi" className={`${fontSans.variable}`}>
      <body className="">{children}</body>
    </html>
  );
}
