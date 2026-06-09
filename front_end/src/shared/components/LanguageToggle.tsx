"use client";

import clsx from "clsx";
import { Globe2 } from "lucide-react";
import { useI18n } from "@/shared/i18n/I18nProvider";

type LanguageToggleProps = {
  variant?: "icon" | "floating";
  className?: string;
};

export default function LanguageToggle({
  variant = "icon",
  className,
}: LanguageToggleProps) {
  const { locale, toggleLocale } = useI18n();
  const nextLocale = locale === "vi" ? "English" : "Tiếng Việt";
  const label = locale === "vi" ? "Đổi sang tiếng Anh" : "Switch to Vietnamese";

  if (variant === "floating") {
    return (
      <button
        type="button"
        data-no-i18n
        onClick={toggleLocale}
        aria-label={label}
        title={label}
        className={clsx(
          "fixed bottom-20 right-4 z-[90] inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-[0_10px_30px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.2)] md:bottom-5",
          className,
        )}
      >
        <Globe2 className="h-4 w-4" />
        <span suppressHydrationWarning>{locale.toUpperCase()}</span>
        <span className="text-slate-400">→</span>
        <span suppressHydrationWarning>{locale === "vi" ? "EN" : "VI"}</span>
        <span className="sr-only">{nextLocale}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      data-no-i18n
      onClick={toggleLocale}
      aria-label={label}
      title={label}
      className={clsx(
        "relative flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-[#222222] transition-all duration-200 hover:bg-[#F7F7F7] hover:shadow-[inset_0_0_0_1px_#EBEBEB] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#222222]",
        className,
      )}
    >
      <Globe2 className="h-5 w-5" strokeWidth={2} />
      <span className="text-xs font-bold" suppressHydrationWarning>{locale.toUpperCase()}</span>
    </button>
  );
}
