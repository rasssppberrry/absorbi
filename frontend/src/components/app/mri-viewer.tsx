"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";

type ViewerFile = { name: string; url: string; isImage: boolean };

export function MriViewer({ files }: { files: ViewerFile[] }) {
  const { t } = useLanguage();
  const images = files.filter((f) => f.isImage);
  const others = files.filter((f) => !f.isImage);
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0) return 0;
        if (next > images.length - 1) return images.length - 1;
        return next;
      });
    },
    [images.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div className="flex flex-col gap-4">
      {images.length > 0 ? (
        <>
          <div className="relative flex min-h-[360px] items-center justify-center border border-border bg-neutral-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[index].url}
              alt={`${t.viewerSlice} ${index + 1}`}
              className="max-h-[440px] w-auto"
            />
            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  disabled={index === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 border border-border bg-white p-1 transition-colors hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  disabled={index === images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 border border-border bg-white p-1 transition-colors hover:bg-neutral-50 disabled:opacity-40"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted">
              {t.viewerSlice} {index + 1} {t.viewerOf} {images.length}
            </span>
            <span className="text-xs text-muted">{images[index].name}</span>
          </div>

          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`shrink-0 border ${i === index ? "border-accent" : "border-border"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={`${t.viewerSlice} ${i + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 border border-border bg-neutral-50 py-12 text-center">
          <ImageOff className="h-6 w-6 text-muted" />
          <p className="text-sm text-muted">{t.noPreview}</p>
        </div>
      )}

      {others.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {t.otherFiles}
          </p>
          <ul className="flex flex-col gap-1">
            {others.map((f) => (
              <li key={f.name} className="flex items-center justify-between text-sm">
                <span className="text-foreground">{f.name}</span>
                <a href={f.url} target="_blank" rel="noreferrer" className="text-accent">
                  {t.download}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">{t.dicomNote}</p>
        </div>
      ) : null}
    </div>
  );
}
