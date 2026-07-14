"use server";

import { randomUUID, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyze } from "@/lib/engine/rules";
import type { ClinicalForm } from "./types";

async function logActivity(entry: {
  actorId: string;
  hospitalId: string;
  action: string;
  studyId: string;
  metadata?: Record<string, unknown>;
}) {
  // Written with the trusted server key so the log cannot be forged or edited
  // by ordinary users. The database also blocks updates and deletes.
  const admin = createAdminClient();
  await admin.from("audit_log").insert({
    actor_id: entry.actorId,
    hospital_id: entry.hospitalId,
    action: entry.action,
    entity: "study",
    entity_id: entry.studyId,
    metadata: entry.metadata ?? {},
  });
}

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

  await logActivity({
    actorId: user.id,
    hospitalId,
    action: "case.created",
    studyId,
  });

  return { studyId, storagePrefix };
}

export async function runAnalysis(formData: FormData) {
  const studyId = String(formData.get("studyId") ?? "");
  if (!studyId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: study } = await supabase
    .from("studies")
    .select("id, hospital_id, clinical_form")
    .eq("id", studyId)
    .single();
  if (!study) return;

  const result = analyze((study.clinical_form ?? {}) as ClinicalForm);

  await supabase.from("predictions").insert({
    study_id: studyId,
    model_version: result.modelVersion,
    backend: "mock",
    red_flag_band: result.redFlag.band,
    red_flag_factors: {
      message: result.redFlag.message,
      triggered: result.redFlag.triggered,
    },
    resorption_prob: result.resorption.mid / 100,
    resorption_band: result.resorption.band,
    trajectory: {
      rangeLow: result.resorption.rangeLow,
      rangeHigh: result.resorption.rangeHigh,
      summary: result.resorption.summary,
      factors: result.resorption.factors,
      milestones: result.resorption.trajectory,
    },
    status: "ready",
    completed_at: new Date().toISOString(),
  });

  await supabase.from("studies").update({ status: "ready" }).eq("id", studyId);

  await logActivity({
    actorId: user.id,
    hospitalId: study.hospital_id as string,
    action: "case.analyzed",
    studyId,
  });

  revalidatePath(`/cases/${studyId}`);
}

export async function signOff(formData: FormData) {
  const studyId = String(formData.get("studyId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "");
  if (!studyId || !decision) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: study } = await supabase
    .from("studies")
    .select("id, hospital_id")
    .eq("id", studyId)
    .single();
  if (!study) return;

  const { data: prediction } = await supabase
    .from("predictions")
    .select("id")
    .eq("study_id", studyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!prediction) return; // an analysis must exist before signing off

  const { error: signError } = await supabase.from("signoffs").insert({
    prediction_id: prediction.id,
    clinician_id: user.id,
    decision,
    note: note || null,
  });
  if (signError) return;

  await supabase.from("studies").update({ status: "signed" }).eq("id", studyId);

  await logActivity({
    actorId: user.id,
    hospitalId: study.hospital_id as string,
    action: "case.signoff",
    studyId,
    metadata: { decision },
  });

  revalidatePath(`/cases/${studyId}`);
}
