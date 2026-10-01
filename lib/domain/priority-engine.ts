import type { UnitState } from "@/lib/domain/types";

export type ActionKind = "task" | "assessment";

export interface PriorityCandidate {
  id: string;
  kind: ActionKind;
  title: string;
  unitId: string | null;
  dueAt: string | null;
  estimatedMinutes: number | null;
  state: UnitState | null;
  backlog: boolean;
}

export interface NextAction {
  candidateId: string;
  actionType: ActionKind;
  unitId: string | null;
  title: string;
  reason: string;
  factors: string[];
  estimatedMinutes: number | null;
  deadline: string | null;
  confidence: "high" | "medium" | "low";
}

function deadlinePressure(dueAt: string | null, now: number) {
  if (!dueAt) return { value: 0, label: "no confirmed deadline" };
  const days = (Date.parse(dueAt) - now) / 86400000;
  if (days <= 0) return { value: 100, label: "due now or overdue" };
  if (days <= 1) return { value: 90, label: "due within one day" };
  if (days <= 3) return { value: 70, label: "due within three days" };
  if (days <= 7) return { value: 45, label: "due within one week" };
  return { value: 10, label: "deadline is more than a week away" };
}

export function calculateNextAction(
  candidates: PriorityCandidate[],
  now = new Date().toISOString(),
): NextAction | null {
  if (!candidates.length) return null;
  const nowMs = Date.parse(now);

  const evaluated = candidates.map((candidate) => {
    const deadline = deadlinePressure(candidate.dueAt, nowMs);
    const stateValue =
      candidate.state === "critical" ? 35 :
      candidate.state === "weak" ? 25 :
      candidate.state === "cooling" ? 15 :
      candidate.state === "protected" ? 10 : 0;
    const backlogValue = candidate.backlog ? 20 : 0;
    const fitValue = candidate.estimatedMinutes != null && candidate.estimatedMinutes <= 60 ? 5 : 0;
    const factors = [
      deadline.label,
      ...(candidate.state ? [`unit state is ${candidate.state}`] : []),
      ...(candidate.backlog ? ["unresolved backlog is recorded"] : []),
      ...(fitValue ? ["estimated duration fits a typical short work block"] : []),
    ];
    return { candidate, value: deadline.value + stateValue + backlogValue + fitValue, factors };
  });

  evaluated.sort((a, b) => b.value - a.value);
  const selected = evaluated[0];

  return {
    candidateId: selected.candidate.id,
    actionType: selected.candidate.kind,
    unitId: selected.candidate.unitId,
    title: selected.candidate.title,
    reason: `Selected because ${selected.factors.slice(0, 2).join(" and ")}.`,
    factors: selected.factors,
    estimatedMinutes: selected.candidate.estimatedMinutes,
    deadline: selected.candidate.dueAt,
    confidence: selected.candidate.dueAt || selected.candidate.state || selected.candidate.backlog ? "high" : "low",
  };
}
