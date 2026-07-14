import {
  AlertTriangle,
  Info,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

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

const triageConfig: Record<
  string,
  { border: string; text: string; label: string; Icon: typeof Info }
> = {
  red: {
    border: "border-l-danger",
    text: "text-danger",
    label: "Possible emergency",
    Icon: AlertTriangle,
  },
  amber: {
    border: "border-l-warning",
    text: "text-warning",
    label: "Prompt review needed",
    Icon: Info,
  },
  green: {
    border: "border-l-success",
    text: "text-success",
    label: "No red flags detected",
    Icon: ShieldCheck,
  },
};

const bandLabel: Record<string, string> = {
  high: "High likelihood of natural resorption",
  intermediate: "Intermediate likelihood of natural resorption",
  low: "Lower likelihood of natural resorption",
};

export function AnalysisResult({ prediction }: { prediction: Prediction }) {
  const t = triageConfig[prediction.red_flag_band] ?? triageConfig.green;
  const traj = prediction.trajectory ?? {};
  const factors = traj.factors ?? [];
  const rangeLow =
    traj.rangeLow ?? Math.round((prediction.resorption_prob ?? 0) * 100);
  const rangeHigh = traj.rangeHigh ?? rangeLow;

  return (
    <div className="flex flex-col gap-6">
      <div className={`border border-border border-l-4 ${t.border} p-4`}>
        <div className={`flex items-center gap-2 ${t.text}`}>
          <t.Icon className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">
            {t.label}
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground">
          {prediction.red_flag_factors?.message}
        </p>
        {prediction.red_flag_factors?.triggered &&
        prediction.red_flag_factors.triggered.length > 0 ? (
          <ul className="mt-2 flex flex-col gap-1">
            {prediction.red_flag_factors.triggered.map((f) => (
              <li key={f} className="text-sm text-muted">
                {f}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h3 className="text-base font-medium">
            {bandLabel[prediction.resorption_band] ?? "Resorption estimate"}
          </h3>
          <span className="text-sm text-muted">
            about {rangeLow} to {rangeHigh} percent
          </span>
        </div>
        {traj.summary ? (
          <p className="text-sm text-foreground">{traj.summary}</p>
        ) : null}

        {factors.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              What shaped this estimate
            </p>
            {factors.map((f) => (
              <div key={f.label} className="flex items-center gap-2 text-sm">
                {f.direction === "increases" ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-danger" />
                )}
                <span className="text-foreground">{f.label}</span>
                <span className="text-muted">
                  {f.direction === "increases"
                    ? "raises the estimate"
                    : "lowers the estimate"}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {traj.milestones && traj.milestones.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Typical recovery path
            </p>
            <div className="flex flex-col">
              {traj.milestones.map((m) => (
                <div
                  key={m.weeks}
                  className="flex gap-3 border-b border-border py-2 text-sm"
                >
                  <span className="w-20 shrink-0 text-muted">
                    Week {m.weeks}
                  </span>
                  <span className="text-foreground">{m.note}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border border-border bg-neutral-50 p-3">
        <p className="text-xs text-muted">
          This is decision support based on published research, not a diagnosis.
          The estimate is uncertain and is shown as a range. A clinician must
          review and decide. Model {prediction.model_version}.
        </p>
      </div>
    </div>
  );
}
