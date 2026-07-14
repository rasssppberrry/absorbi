import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";
import { RED_FLAG_ITEMS, type ClinicalForm } from "@/lib/cases/types";

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

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: study } = await supabase
    .from("studies")
    .select("id, status, created_at, clinical_form")
    .eq("id", id)
    .single();

  if (!study) notFound();

  const form = (study.clinical_form ?? {}) as Partial<ClinicalForm>;
  const activeFlags = RED_FLAG_ITEMS.filter(
    (item) => form.redFlags?.[item.key]
  ).map((item) => item.label);

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

        <Card className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Imaging and analysis
          </h2>
          <p className="text-sm text-muted">
            The MRI viewer and the triage analysis are added in the next steps.
          </p>
        </Card>
      </Container>
    </main>
  );
}
