"use client";

import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n/dictionaries";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "kk", label: "KZ" },
  { code: "en", label: "EN" },
];

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center border border-border">
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          onClick={() => setLang(o.code)}
          className={cn(
            "px-2 py-1 text-xs",
            lang === o.code ? "bg-foreground text-white" : "text-muted"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
