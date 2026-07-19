export type RedFlags = {
  saddleAnesthesia: boolean;
  bladderBowelDysfunction: boolean;
  bilateralLegSymptoms: boolean;
  progressiveMotorWeakness: boolean;
  severeMotorDeficit: boolean;
  historyCancer: boolean;
  unexplainedWeightLoss: boolean;
  feverOrInfection: boolean;
  recentTrauma: boolean;
};

export type ClinicalForm = {
  patientName: string;
  age: number | null;
  bmi: number | null;
  symptomDurationWeeks: number | null;
  level: string;
  herniationType: string;
  herniationSize: string;
  rimEnhancement: string;
  pllStatus: string;
  modicChanges: string;
  redFlags: RedFlags;
};

export const emptyRedFlags: RedFlags = {
  saddleAnesthesia: false,
  bladderBowelDysfunction: false,
  bilateralLegSymptoms: false,
  progressiveMotorWeakness: false,
  severeMotorDeficit: false,
  historyCancer: false,
  unexplainedWeightLoss: false,
  feverOrInfection: false,
  recentTrauma: false,
};

export const RED_FLAG_ITEMS: { key: keyof RedFlags; label: string }[] = [
  { key: "saddleAnesthesia", label: "Saddle anesthesia" },
  { key: "bladderBowelDysfunction", label: "Bladder or bowel dysfunction" },
  { key: "bilateralLegSymptoms", label: "Bilateral leg symptoms" },
  { key: "progressiveMotorWeakness", label: "Progressive motor weakness" },
  { key: "severeMotorDeficit", label: "Severe motor deficit" },
  { key: "historyCancer", label: "History of cancer" },
  { key: "unexplainedWeightLoss", label: "Unexplained weight loss" },
  { key: "feverOrInfection", label: "Fever or suspected infection" },
  { key: "recentTrauma", label: "Recent significant trauma" },
];
