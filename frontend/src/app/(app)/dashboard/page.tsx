import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { StatusBadge } from "@/components/ui/status-badge";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: studies } = await supabase
    .from("studies")
    .select("id, status, created_at")
    .order("created_at", { ascending: false });

  const cases = studies ?? [];

  return (
    <main className="py-10">
      <Container className="flex max-w-6xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Cases</h1>
            <p className="text-sm text-muted">
              Studies submitted at your hospital.
            </p>
          </div>
          <Link href="/cases/new">
            <Button>
              <Plus className="h-4 w-4" />
              New case
            </Button>
          </Link>
        </div>

        {cases.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 py-16 text-center">
            <h2 className="text-lg font-medium">No cases yet</h2>
            <p className="max-w-sm text-sm text-muted">
              When you submit a lumbar spine MRI with a clinical form, it will
              appear here.
            </p>
            <Link href="/cases/new">
              <Button>
                <Plus className="h-4 w-4" />
                Create your first case
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col">
            <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border pb-2 text-xs font-medium uppercase tracking-widest text-muted">
              <span>Case</span>
              <span>Status</span>
              <span>Created</span>
            </div>
            {cases.map((c) => (
              <Link
                key={c.id}
                href={`/cases/${c.id}`}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-border py-4 text-sm transition-colors hover:bg-neutral-50"
              >
                <span className="font-medium">Case {c.id.slice(0, 8)}</span>
                <StatusBadge status={c.status} />
                <span className="text-muted">{formatDate(c.created_at)}</span>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </main>
  );
}
