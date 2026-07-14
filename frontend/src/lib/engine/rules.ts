import type { ClinicalForm, RedFlags } from "@/lib/cases/types";
import type { AnalysisResult, Factor, ResorptionBand, TriageBand } from "./types";

const MODEL_VERSION = "rules-v0";

const CAUDA_EQUINA: { key: keyof RedFlags; label: string }[] = [
  { key: "saddleAnesthesia", label: "Saddle anesthesia" },
  { key: "bladderBowelDysfunction", label: "Bladder or bowel dysfunction" },
  { key: "bilateralLegSymptoms", label: "Bilateral leg symptoms" },
  { key: "progressiveMotorWeakness", label: "Progressive motor weakness" },
  { key: "severeMotorDeficit", label: "Severe motor deficit" },
];

const SERIOUS_PATHOLOGY: { key: keyof RedFlags; label: string }[] = [
  { key: "historyCancer", label: "History of cancer" },
  { key: "unexplainedWeightLoss", label: "Unexplained weight loss" },
  { key: "feverOrInfection", label: "Fever or suspected infection" },
  { key: "recentTrauma", label: "Recent significant trauma" },
];

function triage(flags: RedFlags) {
  const cauda = CAUDA_EQUINA.filter((f) => flags?.[f.key]).map((f) => f.label);
  const serious = SERIOUS_PATHOLOGY.filter((f) => flags?.[f.key]).map((f) => f.label);

  if (cauda.length > 0) {
    return {
      band: "red" as TriageBand,
      message:
        "Possible surgical emergency. Arrange urgent specialist review and MRI now. Do not wait.",
      triggered: [...cauda, ...serious],
    };
  }
  if (serious.length > 0) {
    return {
      band: "amber" as TriageBand,
      message:
        "Not an emergency, but these features suggest prompt clinical review is needed.",
      triggered: serious,
    };
  }
  return {
    band: "green" as TriageBand,
    message:
      "No red flags detected on this screen. A routine pathway is reasonable.",
    triggered: [],
  };
}

function resorption(form: ClinicalForm) {
  let score = 0;
  const factors: Factor[] = [];
  const add = (points: number, label: string) => {
    if (points === 0) return;
    score += points;
    factors.push({ label, direction: points > 0 ? "increases" : "decreases" });
  };

  if (form.herniationType === "sequestration") add(3, "Sequestration morphology");
  else if (form.herniationType === "extrusion") add(2, "Extrusion morphology");

  if (form.herniationSize === "large") add(2, "Large herniation");
  else if (form.herniationSize === "moderate") add(1, "Moderate herniation");

  if (form.rimEnhancement === "present") add(2, "Rim enhancement present");
  if (form.pllStatus === "penetrated") add(2, "Ligament penetration");
  if (form.modicChanges === "present") add(-1, "Modic changes present");

  const dur = form.symptomDurationWeeks;
  if (dur !== null && dur !== undefined) {
    if (dur <= 6) add(1, "Short symptom duration");
    else if (dur > 12) add(-1, "Long symptom duration");
  }

  const age = form.age;
  if (age !== null && age !== undefined) {
    if (age < 40) add(1, "Younger age");
    else if (age > 60) add(-1, "Older age");
  }

  const bmi = form.bmi;
  if (bmi !== null && bmi !== undefined) {
    if (bmi < 25) add(1, "Lower body mass index");
    else if (bmi >= 30) add(-1, "Higher body mass index");
  }

  let band: ResorptionBand;
  let rangeLow: number;
  let rangeHigh: number;
  if (score >= 5) {
    band = "high";
    rangeLow = 70;
    rangeHigh = 90;
  } else if (score >= 1) {
    band = "intermediate";
    rangeLow = 45;
    rangeHigh = 70;
  } else {
    band = "low";
    rangeLow = 20;
    rangeHigh = 45;
  }
  const mid = Math.round((rangeLow + rangeHigh) / 2);

  const summaryByBand: Record<ResorptionBand, string> = {
    high: "The recorded features favour spontaneous resorption. A conservative pathway with review is reasonable for most such cases.",
    intermediate:
      "The features are mixed. Spontaneous resorption is plausible but less certain, so closer follow up is advised.",
    low: "The recorded features are less favourable for spontaneous resorption. Watch closely and seek a surgical opinion if symptoms progress.",
  };

  const trajectory = [
    { weeks: 6, note: "Early review. Many benign herniations begin to settle." },
    { weeks: 12, note: "Re-check. Consider repeat imaging if not improving." },
    { weeks: 24, note: "Most spontaneous resorption typically occurs by now." },
    { weeks: 36, note: "Full reassessment if symptoms still persist." },
  ];

  return {
    band,
    rangeLow,
    rangeHigh,
    mid,
    summary: summaryByBand[band],
    factors,
    trajectory,
  };
}

export function analyze(form: ClinicalForm): AnalysisResult {
  const flags = (form.redFlags ?? {}) as RedFlags;
  return {
    modelVersion: MODEL_VERSION,
    redFlag: triage(flags),
    resorption: resorption(form),
  };
}
