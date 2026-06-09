import type { Metadata } from "next";
import "@/styles/globals.css";
import { AppProvider } from "../features/app/providers/app.provider";
import { AuthModalProvider } from "@/shared/context/AuthModalContext";
import AuthModal from "@/shared/components/AuthModal";
import { I18nProvider } from "@/shared/i18n/I18nProvider";
import LanguageToggle from "@/shared/components/LanguageToggle";

export const metadata: Metadata = {
  title: "GoTravel",
  description: "Du lịch không chỉ là đi, mà là thuộc về nơi bạn đến.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <AuthModalProvider>
        <html lang="vi">
          <body className="">
            <I18nProvider>
              {children}
              <AuthModal />
              <LanguageToggle variant="floating" />
            </I18nProvider>
          </body>
        </html>
      </AuthModalProvider>
    </AppProvider>
  );
}
