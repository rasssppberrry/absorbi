import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: study } = await supabase
    .from("studies")
    .select("id, status, created_at")
    .eq("id", id)
    .single();

  if (!study) notFound();

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
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">
              Case {study.id.slice(0, 8)}
            </h1>
            <StatusBadge status={study.status} />
          </div>
          <p className="text-sm text-muted">
            The MRI viewer and the analysis appear here in later steps.
          </p>
        </Card>
      </Container>
    </main>
  );
}
