"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signIn(input: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (error) {
    return { error: "Email or password is not correct." };
  }
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function registerDoctor(input: {
  hospitalId: string;
  code: string;
  fullName: string;
  email: string;
  password: string;
}) {
  const admin = createAdminClient();

  // 1. Re-verify the hospital access code on the server.
  const { data: valid, error: verifyError } = await admin.rpc(
    "verify_hospital_code",
    { p_hospital_id: input.hospitalId, p_code: input.code }
  );
  if (verifyError) return { error: "Could not verify the hospital code." };
  if (!valid) return { error: "The hospital access code is not correct." };

  // 2. Create a confirmed auth user.
  const { data: created, error: createError } =
    await admin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: {
        full_name: input.fullName,
        hospital_id: input.hospitalId,
      },
    });
  if (createError || !created.user) {
    return { error: createError?.message ?? "Could not create the account." };
  }

  // 3. Create the profile row (service role bypasses row level security).
  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    hospital_id: input.hospitalId,
    full_name: input.fullName,
    email: input.email,
  });
  if (profileError) {
    return { error: "Could not save the profile. " + profileError.message };
  }

  // 4. Sign the new user in, which sets the session cookies.
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });
  if (signInError) {
    return { error: "Account created. Please sign in." };
  }

  redirect("/dashboard");
}
