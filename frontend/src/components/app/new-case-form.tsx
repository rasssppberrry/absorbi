"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCase } from "@/lib/cases/actions";
import { emptyRedFlags, RED_FLAG_ITEMS, type RedFlags } from "@/lib/cases/types";
import { useLanguage } from "@/lib/i18n/provider";
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
  const { t } = useLanguage();

  const rfLabel: Record<string, string> = {
    saddleAnesthesia: t.rfSaddle,
    bladderBowelDysfunction: t.rfBladder,
    bilateralLegSymptoms: t.rfBilateral,
    progressiveMotorWeakness: t.rfProgressive,
    severeMotorDeficit: t.rfSevere,
    historyCancer: t.rfCancer,
    unexplainedWeightLoss: t.rfWeight,
    feverOrInfection: t.rfFever,
    recentTrauma: t.rfTrauma,
  };

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
        <SectionTitle>{t.secPatient}</SectionTitle>
        <Field label={t.patientReference} htmlFor="ref" hint={t.patientRefHint}>
          <Input id="ref" value={patientReference} onChange={(e) => setPatientReference(e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.sex} htmlFor="sex">
            <Select id="sex" value={sex} onChange={(e) => setSex(e.target.value)} required>
              <option value="" disabled>{t.sex}</option>
              <option value="female">{t.sexFemale}</option>
              <option value="male">{t.sexMale}</option>
              <option value="unspecified">{t.sexUnspecified}</option>
            </Select>
          </Field>
          <Field label={t.ageYears} htmlFor="age">
            <Input id="age" type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} required />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>{t.secImaging}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.discLevel} htmlFor="level">
            <Select id="level" value={level} onChange={(e) => setLevel(e.target.value)} required>
              <option value="" disabled>{t.discLevel}</option>
              <option value="L1/L2">L1/L2</option>
              <option value="L2/L3">L2/L3</option>
              <option value="L3/L4">L3/L4</option>
              <option value="L4/L5">L4/L5</option>
              <option value="L5/S1">L5/S1</option>
            </Select>
          </Field>
          <Field label={t.herniationType} htmlFor="htype">
            <Select id="htype" value={herniationType} onChange={(e) => setHerniationType(e.target.value)}>
              <option value="protrusion">{t.typeProtrusion}</option>
              <option value="extrusion">{t.typeExtrusion}</option>
              <option value="sequestration">{t.typeSequestration}</option>
              <option value="unknown">{t.unknownWord}</option>
            </Select>
          </Field>
          <Field label={t.herniationSize} htmlFor="hsize">
            <Select id="hsize" value={herniationSize} onChange={(e) => setHerniationSize(e.target.value)}>
              <option value="small">{t.sizeSmall}</option>
              <option value="moderate">{t.sizeModerate}</option>
              <option value="large">{t.sizeLarge}</option>
              <option value="unknown">{t.unknownWord}</option>
            </Select>
          </Field>
          <Field label={t.rimEnhancement} htmlFor="rim">
            <Select id="rim" value={rimEnhancement} onChange={(e) => setRimEnhancement(e.target.value)}>
              <option value="present">{t.present}</option>
              <option value="absent">{t.absent}</option>
              <option value="not_assessed">{t.notAssessed}</option>
            </Select>
          </Field>
          <Field label={t.pll} htmlFor="pll">
            <Select id="pll" value={pllStatus} onChange={(e) => setPllStatus(e.target.value)}>
              <option value="intact">{t.intact}</option>
              <option value="penetrated">{t.penetrated}</option>
              <option value="unknown">{t.unknownWord}</option>
            </Select>
          </Field>
          <Field label={t.modic} htmlFor="modic">
            <Select id="modic" value={modicChanges} onChange={(e) => setModicChanges(e.target.value)}>
              <option value="none">{t.noneWord}</option>
              <option value="present">{t.present}</option>
              <option value="unknown">{t.unknownWord}</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>{t.secSymptoms}</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t.symptomDuration} htmlFor="dur">
            <Input id="dur" type="number" min={0} value={symptom} onChange={(e) => setSymptom(e.target.value)} />
          </Field>
          <Field label={t.bmi} htmlFor="bmi" hint={t.optional}>
            <Input id="bmi" type="number" min={0} step="0.1" value={bmi} onChange={(e) => setBmi(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>{t.secRedFlags}</SectionTitle>
        <p className="text-sm text-muted">{t.redFlagsHint}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {RED_FLAG_ITEMS.map((item) => (
            <Checkbox
              key={item.key}
              label={rfLabel[item.key] ?? item.label}
              checked={redFlags[item.key]}
              onChange={(v) => setFlag(item.key, v)}
            />
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <SectionTitle>{t.secUpload}</SectionTitle>
        <p className="text-sm text-muted">{t.uploadHint}</p>
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
          {pending ? t.savingCase : t.createCase}
        </Button>
      </div>
    </form>
  );
}
