import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function NewCasePage() {
  return (
    <main className="py-10">
      <Container className="flex max-w-3xl flex-col gap-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to cases
        </Link>
        <Card className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">New case</h1>
          <p className="text-sm text-muted">
            The clinical form and MRI upload are built in the next step.
          </p>
        </Card>
      </Container>
    </main>
  );
}
