import { ExecutionPhase } from "@prisma/client";

type Phase = Pick<ExecutionPhase, "creditConsumed">;

export function GetPhasesTotalCost(phases: Phase[]) {
  return phases.reduce((acc, phase) => acc + (phase.creditConsumed || 0), 0);
}
