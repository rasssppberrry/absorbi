import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, hospital_id")
    .eq("id", user.id)
    .single();

  let hospitalName = "";
  if (profile?.hospital_id) {
    const { data: hospital } = await supabase
      .from("hospitals")
      .select("name")
      .eq("id", profile.hospital_id)
      .single();
    hospitalName = hospital?.name ?? "";
  }

  return (
    <main className="min-h-screen py-16">
      <Container className="flex flex-col gap-6">
        <Card className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to Absorbi
          </h1>
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-foreground">
              Signed in as {profile?.full_name ?? user.email}
            </p>
            {hospitalName ? (
              <p className="text-muted">{hospitalName}</p>
            ) : null}
            <p className="text-muted">{profile?.email ?? user.email}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </Card>
      </Container>
    </main>
  );
}
