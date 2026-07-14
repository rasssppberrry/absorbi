import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/app/top-bar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, hospital_id")
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
    <div className="min-h-screen">
      <TopBar
        name={profile?.full_name ?? user.email ?? ""}
        hospital={hospitalName}
      />
      {children}
    </div>
  );
}
