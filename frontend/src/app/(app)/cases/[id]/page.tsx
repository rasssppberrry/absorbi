import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/status-badge";
import { MriViewer } from "@/components/app/mri-viewer";
import { AnalysisResult } from "@/components/app/analysis-result";
import { runAnalysis, signOff } from "@/lib/cases/actions";
import { RED_FLAG_ITEMS, type ClinicalForm } from "@/lib/cases/types";
import { getDict, getLang } from "@/lib/i18n/server";
import { tr } from "@/lib/i18n/dictionaries";

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp", "gif", "bmp"];

function isImageName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return IMAGE_EXTENSIONS.includes(ext);
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function clinicianName(signoff: { profiles?: unknown }) {
  const p = signoff.profiles as { full_name?: string } | { full_name?: string }[] | null;
  if (!p) return "Clinician";
  if (Array.isArray(p)) return p[0]?.full_name ?? "Clinician";
  return p.full_name ?? "Clinician";
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDict();
  const lang = await getLang();
  const supabase = await createClient();

  const { data: study } = await supabase
    .from("studies")
    .select("id, status, created_at, clinical_form, storage_prefix")
    .eq("id", id)
    .single();

  if (!study) notFound();

  const form = (study.clinical_form ?? {}) as Partial<ClinicalForm>;
  const activeFlags = RED_FLAG_ITEMS.filter((item) => form.redFlags?.[item.key]).map(
    (item) => tr(lang, item.label)
  );

  const { data: prediction } = await supabase
    .from("predictions")
    .select(
      "model_version, red_flag_band, red_flag_factors, resorption_prob, resorption_band, trajectory"
    )
    .eq("study_id", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: signoffs } = await supabase
    .from("signoffs")
    .select("id, decision, note, signed_at, profiles(full_name), predictions!inner(study_id)")
    .eq("predictions.study_id", id)
    .order("signed_at", { ascending: false });

  const { data: activity } = await supabase
    .from("audit_log")
    .select("id, action, created_at")
    .eq("entity", "study")
    .eq("entity_id", id)
    .order("created_at", { ascending: false });

  const activityLabels: Record<string, string> = {
    "case.created": t.actCreated,
    "case.analyzed": t.actAnalyzed,
    "case.signoff": t.actSignoff,
  };

  function showValue(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === "") return t.notRecorded;
    return tr(lang, String(value));
  }

  let viewerFiles: { name: string; url: string; isImage: boolean }[] = [];
  if (study.storage_prefix) {
    const { data: list } = await supabase.storage
      .from("mri")
      .list(study.storage_prefix, { limit: 100 });
    const names = (list ?? []).map((o) => o.name).filter((n) => n && !n.startsWith("."));
    if (names.length > 0) {
      const paths = names.map((n) => `${study.storage_prefix}/${n}`);
      const { data: signed } = await supabase.storage.from("mri").createSignedUrls(paths, 3600);
      viewerFiles = (signed ?? [])
        .map((s, i) => ({ name: names[i], url: s.signedUrl ?? "", isImage: isImageName(names[i]) }))
        .filter((f) => f.url);
    }
  }

  return (
    <main className="py-10">
      <Container className="flex max-w-4xl flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToCases}
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            {t.caseLabel} {study.id.slice(0, 8)}
          </h1>
          <StatusBadge status={study.status} />
        </div>

        <Card className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{t.mriImages}</h2>
          <MriViewer files={viewerFiles} />
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            {t.clinicalSummary}
          </h2>
          <Row label={t.ageYears} value={showValue(form.age)} />
          <Row label={t.symptomDuration} value={showValue(form.symptomDurationWeeks)} />
          <Row label={t.bmi} value={showValue(form.bmi)} />
          <Row label={t.discLevel} value={showValue(form.level)} />
          <Row label={t.herniationType} value={showValue(form.herniationType)} />
          <Row label={t.herniationSize} value={showValue(form.herniationSize)} />
          <Row label={t.rimEnhancement} value={showValue(form.rimEnhancement)} />
          <Row label={t.pll} value={showValue(form.pllStatus)} />
          <Row label={t.modic} value={showValue(form.modicChanges)} />
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            {t.redFlagsPresent}
          </h2>
          {activeFlags.length === 0 ? (
            <p className="text-sm text-muted">{t.noneRecorded}</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {activeFlags.map((flag) => (
                <li key={flag} className="text-sm text-foreground">
                  {flag}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
              {t.triageAnalysis}
            </h2>
            <form action={runAnalysis}>
              <input type="hidden" name="studyId" value={study.id} />
              <Button type="submit" variant={prediction ? "secondary" : "primary"} size="sm">
                {prediction ? t.rerunAnalysis : t.runAnalysis}
              </Button>
            </form>
          </div>
          {prediction ? (
            <AnalysisResult prediction={prediction} />
          ) : (
            <p className="text-sm text-muted">{t.noAnalysisYet}</p>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            {t.clinicalSignOff}
          </h2>
          {signoffs && signoffs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {signoffs.map((s) => (
                <div key={s.id} className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{tr(lang, s.decision)}</span>
                    <span className="text-xs text-muted">{formatDateTime(s.signed_at)}</span>
                  </div>
                  <p className="text-xs text-muted">{clinicianName(s)}</p>
                  {s.note ? <p className="mt-1 text-sm text-foreground">{s.note}</p> : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">{t.noSignOff}</p>
          )}

          {prediction ? (
            <form action={signOff} className="flex flex-col gap-4 border-t border-border pt-4">
              <input type="hidden" name="studyId" value={study.id} />
              <Field label={t.decision} htmlFor="decision">
                <Select id="decision" name="decision" defaultValue="" required>
                  <option value="" disabled>
                    {t.selectDecision}
                  </option>
                  <option value="Conservative management">{t.decConservative}</option>
                  <option value="Refer for surgical opinion">{t.decRefer}</option>
                  <option value="Urgent referral">{t.decUrgent}</option>
                  <option value="Further investigation">{t.decInvestigation}</option>
                </Select>
              </Field>
              <Field label={t.note} htmlFor="note" hint={t.optional}>
                <Textarea id="note" name="note" />
              </Field>
              <div>
                <Button type="submit" size="sm">
                  {t.recordSignOff}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">{t.signOffBeforeAnalysis}</p>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            {t.activityLog}
          </h2>
          {activity && activity.length > 0 ? (
            <div className="flex flex-col">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border-b border-border py-2 text-sm"
                >
                  <span className="text-foreground">{activityLabels[a.action] ?? a.action}</span>
                  <span className="text-xs text-muted">{formatDateTime(a.created_at)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">{t.noActivity}</p>
          )}
        </Card>
      </Container>
    </main>
  );
}
