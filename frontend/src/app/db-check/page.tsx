import { supabasePublic } from "@/lib/supabase/public";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";

export default async function DbCheck() {
  const { data, error } = await supabasePublic
    .from("cities")
    .select("name")
    .order("name");

  return (
    <main className="min-h-screen py-16">
      <Container className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Database check</h1>
        {error ? (
          <p className="text-sm text-danger">
            Could not reach the database: {error.message}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted">Cities loaded from Supabase:</p>
            <ul className="flex flex-col gap-1">
              {data?.map((c) => (
                <li key={c.name} className="text-sm text-foreground">
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
    </main>
  );
}
