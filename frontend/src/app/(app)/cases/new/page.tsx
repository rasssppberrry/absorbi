import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/container";
import { NewCaseForm } from "@/components/app/new-case-form";
import { getDict } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function NewCasePage() {
  const t = await getDict();
  return (
    <main className="py-10">
      <Container className="flex max-w-3xl flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.backToCases}
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t.newCaseTitle}</h1>
          <p className="text-sm text-muted">{t.newCaseSub}</p>
        </div>
        <NewCaseForm />
      </Container>
    </main>
  );
}
