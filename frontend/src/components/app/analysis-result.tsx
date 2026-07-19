"use client";

import { AlertTriangle, Info, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { useLanguage } from "@/lib/i18n/provider";
import { tr } from "@/lib/i18n/dictionaries";

type Prediction = {
  model_version: string;
  red_flag_band: string;
  red_flag_factors: { message?: string; triggered?: string[] } | null;
  resorption_prob: number | null;
  resorption_band: string;
  trajectory: {
    rangeLow?: number;
    rangeHigh?: number;
    summary?: string;
    factors?: { label: string; direction: string }[];
    milestones?: { weeks: number; note: string }[];
  } | null;
};

export function AnalysisResult({ prediction }: { prediction: Prediction }) {
  const { lang, t } = useLanguage();

  const triageConfig: Record<
    string,
    { border: string; text: string; label: string; message: string; Icon: typeof Info }
  > = {
    red: {
      border: "border-l-danger",
      text: "text-danger",
      label: t.triageRedLabel,
      message: t.triageMsgRed,
      Icon: AlertTriangle,
    },
    amber: {
      border: "border-l-warning",
      text: "text-warning",
      label: t.triageAmberLabel,
      message: t.triageMsgAmber,
      Icon: Info,
    },
    green: {
      border: "border-l-success",
      text: "text-success",
      label: t.triageGreenLabel,
      message: t.triageMsgGreen,
      Icon: ShieldCheck,
    },
  };

  const bandLabel: Record<string, string> = {
    high: t.resHigh,
    intermediate: t.resIntermediate,
    low: t.resLow,
  };
  const bandSummary: Record<string, string> = {
    high: t.resSummaryHigh,
    intermediate: t.resSummaryIntermediate,
    low: t.resSummaryLow,
  };

  const c = triageConfig[prediction.red_flag_band] ?? triageConfig.green;
  const traj = prediction.trajectory ?? {};
  const factors = traj.factors ?? [];
  const rangeLow = traj.rangeLow ?? Math.round((prediction.resorption_prob ?? 0) * 100);
  const rangeHigh = traj.rangeHigh ?? rangeLow;
  const triggered = prediction.red_flag_factors?.triggered ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className={`border border-border border-l-4 ${c.border} p-4`}>
        <div className={`flex items-center gap-2 ${c.text}`}>
          <c.Icon className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">{c.label}</span>
        </div>
        <p className="mt-2 text-sm text-foreground">{c.message}</p>
        {triggered.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1">
            {triggered.map((f) => (
              <li key={f} className="text-sm text-muted">
                {tr(lang, f)}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-medium">
            {bandLabel[prediction.resorption_band] ?? ""}
          </h3>
          <span className="text-sm text-muted">
            {t.aboutWord} {rangeLow} {t.toWord} {rangeHigh} {t.percentWord}
          </span>
        </div>
        <p className="text-sm text-foreground">
          {bandSummary[prediction.resorption_band] ?? ""}
        </p>

        {factors.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              {t.whatShaped}
            </p>
            {factors.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm">
                {f.direction === "increases" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span className="text-foreground">{tr(lang, f.label)}</span>
                <span className="text-muted">
                  {f.direction === "increases" ? t.raisesEstimate : t.lowersEstimate}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {traj.milestones && traj.milestones.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              {t.typicalRecovery}
            </p>
            <div className="flex flex-col">
              {traj.milestones.map((m) => (
                <div key={m.weeks} className="flex gap-3 border-b border-border py-2 text-sm">
                  <span className="w-24 shrink-0 text-muted">
                    {t.weekWord} {m.weeks}
                  </span>
                  <span className="text-foreground">{tr(lang, m.note)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border border-border bg-neutral-50 p-3">
        <p className="text-xs text-muted">
          {t.disclaimer} {t.modelWord} {prediction.model_version}.
        </p>
      </div>
    </div>
  );
}
