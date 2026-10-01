import type { CourseState } from "@/lib/domain/types";

export interface CourseStateSignals {
  currentState?: CourseState | null;
  backlog: boolean;
  overdueTasks: number;
  missedAssessments: number;
  assessmentsDueWithinDays: number;
  lastPracticeAt?: string | null;
  now?: string;
}

export interface CalculatedCourseState {
  state: CourseState;
  backlog: boolean;
  reason: string;
}

const daysSince = (value: string | null | undefined, now: string) => {
  if (!value) return null;
  return Math.max(0, (Date.parse(now) - Date.parse(value)) / 86400000);
};

export function calculateCourseState(signals: CourseStateSignals): CalculatedCourseState {
  const now = signals.now ?? new Date().toISOString();

  if (signals.currentState === "protected") {
    return {
      state: "protected",
      backlog: signals.backlog,
      reason: "Protected state is preserved until the underlying condition is deliberately changed.",
    };
  }

  if (signals.missedAssessments > 0) {
    return {
      state: "critical",
      backlog: signals.backlog,
      reason: "A confirmed assessment has been missed.",
    };
  }

  if (signals.overdueTasks > 0 && signals.assessmentsDueWithinDays <= 1) {
    return {
      state: "critical",
      backlog: true,
      reason: "Overdue work coincides with an assessment due within one day.",
    };
  }

  if (signals.backlog) {
    return {
      state: "weak",
      backlog: true,
      reason: "Unresolved academic backlog is recorded for this course.",
    };
  }

  const staleDays = daysSince(signals.lastPracticeAt, now);
  if (staleDays != null && staleDays >= 14) {
    return {
      state: "cooling",
      backlog: false,
      reason: "Recorded practice evidence is becoming stale.",
    };
  }

  return {
    state: "stable",
    backlog: false,
    reason: "No stronger state signal is currently recorded.",
  };
}
