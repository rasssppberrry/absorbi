"use client";

import { useLanguage } from "@/lib/i18n/provider";

export function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const labels: Record<string, string> = {
    draft: t.statusDraft,
    processing: t.statusProcessing,
    ready: t.statusReady,
    signed: t.statusSigned,
  };
  return (
    <span className="inline-flex items-center rounded-[2px] border border-border px-2 py-0.5 text-xs text-muted">
      {labels[status] ?? status}
    </span>
  );
}
