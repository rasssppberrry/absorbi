"use client";

import { useLanguage } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center border border-border">
      <button
        type="button"
        onClick={() => setLang("ru")}
        className={cn(
          "px-2 py-1 text-xs",
          lang === "ru" ? "bg-foreground text-white" : "text-muted"
        )}
      >
        RU
      </button>
      <button
        type="button"
        onClick={() => setLang("kk")}
        className={cn(
          "px-2 py-1 text-xs",
          lang === "kk" ? "bg-foreground text-white" : "text-muted"
        )}
      >
        KZ
      </button>
    </div>
  );
}
