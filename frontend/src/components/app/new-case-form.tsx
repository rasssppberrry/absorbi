"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCase } from "@/lib/cases/actions";
import { emptyRedFlags, RED_FLAG_ITEMS, type RedFlags } from "@/lib/cases/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
      {children}
    </h2>
  );
}

export function NewCaseForm() {
  const router = useRouter();

  const [patientReference, setPatientReference] = useState("");
  const [sex, setSex] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState("");
  const [symptom, setSymptom] = useState("");
  const [level, setLevel] = useState("");
  const [herniationType, setHerniationType] = useState("unknown");
  const [herniationSize, setHerniationSize] = useState("unknown");
  const [rimEnhancement, setRimEnhancement] = useState("not_assessed");
  const [pllStatus, setPllStatus] = useState("unknown");
  const [modicChanges, setModicChanges] = useState("unknown");
  const [redFlags, setRedFlags] = useState<RedFlags>(emptyRedFlags);
  const [files, setFiles] = useState<FileList | null>(null);

  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function setFlag(key: keyof RedFlags, value: boolean) {
    setRedFlags((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const result = await createCase({
      patientReference,
      sex,
      form: {
        age: age === "" ? null : Number(age),
        bmi: bmi === "" ? null : Number(bmi),
        symptomDurationWeeks: symptom === "" ? null : Number(symptom),
        level,
        herniationType,
        herniationSize,
        rimEnhancement,
        pllStatus,
        modicChanges,
        redFlags,
      },
    });

    if ("error" in result) {
      setError(result.error);
      setPending(false);
      return;
    }

    if (files && files.length > 0) {
      const supabase = createClient();
      for (const file of Array.from(files)) {
        const { error: uploadError } = await supabase.storage
          .from("mri")
          .upload(`${result.storagePrefix}/${file.name}`, file, {
            upsert: true,
          });
        if (uploadError) {
          setError("Case saved, but the image upload failed: " + uploadError.message);
          setPending(false);
          return;
        }
      }
    }

    router.push(`/cases/${result.studyId}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <SectionTitle>Patient</SectionTitle>
        <Field label="Patient reference" htmlFor="ref" hint="Optional. Stored only as a one way hash.">
          <Input id="ref" value={patientReference} onChange={(e) => setPatientReference(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Sex" htmlFor="sex">
            <Select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} required>
              <option value="" disabled>Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unspecified">Unspecified</option>
            </Select>
          </Field>
          <Field label="Age in years" htmlFor="age">
            <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} required />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>Imaging findings</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Disc level" htmlFor="level">
            <Select id="level" value={level} onChange={(e) => setLevel(e.target.value)} required>
              <option value="" disabled>Select</option>
              <option value="L1/L2">L1/L2</option>
              <option value="L2/L3">L2/L3</option>
              <option value="L3/L4">L3/L4</option>
              <option value="L4/L5">L4/L5</option>
              <option value="L5/S1">L5/S1</option>
            </Select>
          </Field>
          <Field label="Herniation type" htmlFor="htype">
            <Select id="htype" value={herniationType} onChange={(e) => setHerniationType(e.target.value)}>
              <option value="protrusion">Protrusion</option>
              <option value="extrusion">Extrusion</option>
              <option value="sequestration">Sequestration</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Herniation size" htmlFor="hsize">
            <Select id="hsize" value={herniationSize} onChange={(e) => setHerniationSize(e.target.value)}>
              <option value="small">Small</option>
              <option value="moderate">Moderate</option>
              <option value="large">Large</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Rim enhancement" htmlFor="rim">
            <Select id="rim" value={rimEnhancement} onChange={(e) => setRimEnhancement(e.target.value)}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="not_assessed">Not assessed</option>
            </Select>
          </Field>
          <Field label="Posterior longitudinal ligament" htmlFor="pll">
            <Select id="pll" value={pllStatus} onChange={(e) => setPllStatus(e.target.value)}>
              <option value="intact">Intact</option>
              <option value="penetrated">Penetrated</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
          <Field label="Modic changes" htmlFor="modic">
            <Select id="modic" value={modicChanges} onChange={(e) => setModicChanges(e.target.value)}>
              <option value="none">None</option>
              <option value="present">Present</option>
              <option value="unknown">Unknown</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>Symptoms</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Symptom duration in weeks" htmlFor="dur">
            <Input id="dur" type="number" min={0} value={symptom} onChange={(e) => setSymptom(e.target.value)} />
          </Field>
          <Field label="Body mass index" htmlFor="bmi" hint="Optional">
            <Input id="bmi" type="number" min={0} step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>Red flag screen</SectionTitle>
        <p className="text-sm text-muted">Check any that are present. These drive the safety triage.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RED_FLAG_ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              label={item.label}
              checked={redFlags[item.key]}
              onChange={(v) => setFlag(item.key, v)}
            />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>MRI upload</SectionTitle>
        <p className="text-sm text-muted">Optional. You can attach the lumbar MRI files for this case.</p>
        <input
          type="file"
          multiple
          accept=".dcm,image/*"
          onChange={(e) => setFiles(e.target.files)}
          className="block w-full text-sm text-muted file:mr-4 file:rounded-[2px] file:border file:border-border file:bg-white file:px-4 file:py-2 file:text-sm file:text-foreground hover:file:bg-neutral-50"
        />
      </Card>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving case" : "Create case"}
        </Button>
      </div>
    </form>
  );
}
