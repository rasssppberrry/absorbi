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
import { RED_FLAG_ITEMS, type ClinicalForm } from "@/lib/cases/types";
import { runAnalysis, signOff } from "@/lib/cases/actions";

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

function show(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  return String(value);
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

const ACTIVITY_LABELS: Record<string, string> = {
  "case.created": "Case created",
  "case.analyzed": "Analysis run",
  "case.signoff": "Signed off",
};

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: study } = await supabase
    .from("studies")
    .select("id, status, created_at, clinical_form, storage_prefix")
    .eq("id", id)
    .single();

  if (!study) notFound();

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

  const form = (study.clinical_form ?? {}) as Partial<ClinicalForm>;
  const activeFlags = RED_FLAG_ITEMS.filter(
    (item) => form.redFlags?.[item.key]
  ).map((item) => item.label);

  let viewerFiles: { name: string; url: string; isImage: boolean }[] = [];
  if (study.storage_prefix) {
    const { data: list } = await supabase.storage
      .from("mri")
      .list(study.storage_prefix, { limit: 100 });
    const names = (list ?? [])
      .map((o) => o.name)
      .filter((n) => n && !n.startsWith("."));
    if (names.length > 0) {
      const paths = names.map((n) => `${study.storage_prefix}/${n}`);
      const { data: signed } = await supabase.storage
        .from("mri")
        .createSignedUrls(paths, 3600);
      viewerFiles = (signed ?? [])
        .map((s, i) => ({
          name: names[i],
          url: s.signedUrl ?? "",
          isImage: isImageName(names[i]),
        }))
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
          Back to cases
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">
            Case {study.id.slice(0, 8)}
          </h1>
          <StatusBadge status={study.status} />
        </div>

        <Card className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            MRI images
          </h2>
          <MriViewer files={viewerFiles} />
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
            Clinical summary
          </h2>
          <Row label="Age in years" value={show(form.age)} />
          <Row label="Symptom duration in weeks" value={show(form.symptomDurationWeeks)} />
          <Row label="Body mass index" value={show(form.bmi)} />
          <Row label="Disc level" value={show(form.level)} />
          <Row label="Herniation type" value={show(form.herniationType)} />
          <Row label="Herniation size" value={show(form.herniationSize)} />
          <Row label="Rim enhancement" value={show(form.rimEnhancement)} />
          <Row label="Posterior longitudinal ligament" value={show(form.pllStatus)} />
          <Row label="Modic changes" value={show(form.modicChanges)} />
        </Card>

        <Card className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Red flags present
          </h2>
          {activeFlags.length === 0 ? (
            <p className="text-sm text-muted">None recorded.</p>
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
              Triage analysis
            </h2>
            <form action={runAnalysis}>
              <input type="hidden" name="studyId" value={study.id} />
              <Button type="submit" variant={prediction ? "secondary" : "primary"} size="sm">
                {prediction ? "Re-run analysis" : "Run analysis"}
              </Button>
            </form>
          </div>
          {prediction ? (
            <AnalysisResult prediction={prediction} />
          ) : (
            <p className="text-sm text-muted">
              No analysis yet. Run the analysis to see the triage light and the
              resorption estimate.
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Clinical sign off
          </h2>

          {signoffs && signoffs.length > 0 ? (
            <div className="flex flex-col gap-3">
              {signoffs.map((s) => (
                <div key={s.id} className="border-b border-border pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{s.decision}</span>
                    <span className="text-xs text-muted">
                      {formatDateTime(s.signed_at)}
                    </span>
                  </div>
                  <p className="text-xs text-muted">{clinicianName(s)}</p>
                  {s.note ? (
                    <p className="mt-1 text-sm text-foreground">{s.note}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No sign off recorded yet.</p>
          )}

          {prediction ? (
            <form action={signOff} className="flex flex-col gap-4 border-t border-border pt-4">
              <input type="hidden" name="studyId" value={study.id} />
              <Field label="Decision" htmlFor="decision">
                <Select id="decision" name="decision" defaultValue="" required>
                  <option value="" disabled>
                    Select a decision
                  </option>
                  <option value="Conservative management">Conservative management</option>
                  <option value="Refer for surgical opinion">Refer for surgical opinion</option>
                  <option value="Urgent referral">Urgent referral</option>
                  <option value="Further investigation">Further investigation</option>
                </Select>
              </Field>
              <Field label="Note" htmlFor="note" hint="Optional">
                <Textarea id="note" name="note" />
              </Field>
              <div>
                <Button type="submit" size="sm">
                  Record sign off
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-sm text-muted">
              Run the analysis before recording a sign off.
            </p>
          )}
        </Card>

        <Card className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Activity log
          </h2>
          {activity && activity.length > 0 ? (
            <div className="flex flex-col">
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between border-b border-border py-2 text-sm"
                >
                  <span className="text-foreground">
                    {ACTIVITY_LABELS[a.action] ?? a.action}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDateTime(a.created_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No activity yet.</p>
          )}
        </Card>
      </Container>
    </main>
  );
}
