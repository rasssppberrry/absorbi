import { Container } from "@/components/ui/container";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <Container className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Absorbi</h1>
        <p className="max-w-md text-sm text-muted">
          Clinical decision support for lumbar disc herniation. An objective
          second read that flags the emergencies and stratifies the rest.
        </p>
      </Container>
    </main>
  );
}
