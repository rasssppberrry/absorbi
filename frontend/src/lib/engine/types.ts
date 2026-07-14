export type FactorDirection = "increases" | "decreases";
export type Factor = { label: string; direction: FactorDirection };
export type TriageBand = "red" | "amber" | "green";
export type ResorptionBand = "high" | "intermediate" | "low";
export type TrajectoryMilestone = { weeks: number; note: string };

export type AnalysisResult = {
  modelVersion: string;
  redFlag: {
    band: TriageBand;
    message: string;
    triggered: string[];
  };
  resorption: {
    band: ResorptionBand;
    rangeLow: number;
    rangeHigh: number;
    mid: number;
    summary: string;
    factors: Factor[];
    trajectory: TrajectoryMilestone[];
  };
};
