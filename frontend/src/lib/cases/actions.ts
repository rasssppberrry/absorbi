"use server";

import { randomUUID, createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import type { ClinicalForm } from "./types";

type CreateCaseInput = {
  patientReference: string;
  sex: string;
  form: ClinicalForm;
};

export async function createCase(
  input: CreateCaseInput
): Promise<{ studyId: string; storagePrefix: string } | { error: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You are not signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("hospital_id")
    .eq("id", user.id)
    .single();
  if (!profile?.hospital_id) return { error: "Your profile has no hospital." };

  const hospitalId = profile.hospital_id as string;
  const patientId = randomUUID();
  const studyId = randomUUID();
  const storagePrefix = `${hospitalId}/${studyId}`;
  const mrnHash = input.patientReference.trim()
    ? createHash("sha256").update(input.patientReference.trim()).digest("hex")
    : null;

  const { error: patientError } = await supabase.from("patients").insert({
    id: patientId,
    hospital_id: hospitalId,
    sex: input.sex || null,
    mrn_hash: mrnHash,
    created_by: user.id,
  });
  if (patientError) {
    return { error: "Could not save the patient. " + patientError.message };
  }

  const { error: studyError } = await supabase.from("studies").insert({
    id: studyId,
    patient_id: patientId,
    hospital_id: hospitalId,
    clinical_form: input.form,
    status: "draft",
    storage_prefix: storagePrefix,
    uploaded_by: user.id,
  });
  if (studyError) {
    return { error: "Could not save the case. " + studyError.message };
  }

  return { studyId, storagePrefix };
}
