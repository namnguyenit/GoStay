"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  type Locale,
  translateStaticText,
} from "@/shared/i18n/dictionary";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (value: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const textOriginals = new WeakMap<Text, string>();

const SKIP_SELECTOR = [
  "script",
  "style",
  "noscript",
  "code",
  "pre",
  "svg",
  "canvas",
  "textarea",
  "[data-no-i18n]",
  "[data-no-translate]",
].join(",");

const TRANSLATABLE_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt"] as const;

function getInitialLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return stored === "en" || stored === "vi" ? stored : DEFAULT_LOCALE;
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  return !parent || Boolean(parent.closest(SKIP_SELECTOR));
}

function translateTextNode(node: Text, locale: Locale) {
  if (shouldSkipNode(node)) return;

  const original = textOriginals.get(node) ?? node.nodeValue ?? "";
  if (!textOriginals.has(node)) {
    textOriginals.set(node, original);
  }

  const translated = translateStaticText(original, locale);
  if (node.nodeValue !== translated) {
    node.nodeValue = translated;
  }
}

function translateElementAttributes(element: Element, locale: Locale) {
  if (element.closest(SKIP_SELECTOR)) return;

  for (const attr of TRANSLATABLE_ATTRIBUTES) {
    const current = element.getAttribute(attr);
    if (!current) continue;

    const originalAttr = `data-i18n-original-${attr}`;
    const original = element.getAttribute(originalAttr) ?? current;
    if (!element.hasAttribute(originalAttr)) {
      element.setAttribute(originalAttr, original);
    }

    const translated = translateStaticText(original, locale);
    if (current !== translated) {
      element.setAttribute(attr, translated);
    }
  }
}

function translateRoot(root: ParentNode, locale: Locale) {
  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = textWalker.nextNode();
  while (node) {
    translateTextNode(node as Text, locale);
    node = textWalker.nextNode();
  }

  if (root instanceof Element) {
    translateElementAttributes(root, locale);
  }

  root.querySelectorAll?.("*").forEach((element) => translateElementAttributes(element, locale));
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => getInitialLocale());

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "vi" ? "en" : "vi");
  }, [locale, setLocale]);

  const t = useCallback((value: string) => translateStaticText(value, locale), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    translateRoot(document.body, locale);

    let scheduled = false;
    const scheduleTranslate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(() => {
        scheduled = false;
        translateRoot(document.body, locale);
      });
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "childList" || mutation.type === "characterData") {
          scheduleTranslate();
          return;
        }

        if (mutation.type === "attributes" && TRANSLATABLE_ATTRIBUTES.includes(mutation.attributeName as never)) {
          scheduleTranslate();
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    return () => observer.disconnect();
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, setLocale, t, toggleLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
