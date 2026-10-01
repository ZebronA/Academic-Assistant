export type CourseState = "protected" | "stable" | "cooling" | "weak" | "critical";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskType = "study" | "practice" | "assignment" | "review" | "admin" | "other";
export type AssessmentStatus = "upcoming" | "in_progress" | "completed" | "missed" | "cancelled";
export type AssessmentType = "quiz" | "cat" | "exam" | "assignment" | "practical" | "other";
export type Source = "user" | "assistant" | "system" | "imported" | "university";
export type ConfirmationStatus = "proposed" | "confirmed" | "rejected";

export interface CreateTaskInput {
  userId: string; courseId?: string | null; recurringRequirementId?: string | null;
  title: string; description?: string | null; taskType: TaskType;
  estimatedMinutes?: number | null; dueAt?: string | null; source: Source;
}
export interface CompleteTaskInput { userId: string; taskId: string; completedAt?: string; }
export interface CreateAssessmentInput {
  userId: string; courseId: string; title: string; assessmentType: AssessmentType;
  startsAt?: string | null; dueAt?: string | null; weightPercent?: number | null; notes?: string | null;
}
export interface CompleteAssessmentInput { userId: string; assessmentId: string; }
export interface CreateObservationInput {
  userId: string; courseId?: string | null; taskId?: string | null; assessmentId?: string | null;
  content: string; observedAt?: string; source: Source; confidence?: number | null;
  confirmationStatus: ConfirmationStatus;
}
export interface RecordStudySessionInput {
  userId: string; courseId?: string | null; taskId?: string | null;
  startedAt: string; endedAt: string; durationMinutes?: number;
  outcome?: string | null; notes?: string | null; source: Source;
}
export interface RecordAcademicEventInput {
  userId: string; courseId?: string | null; taskId?: string | null; assessmentId?: string | null;
  eventType: string; occurredAt?: string; title?: string | null; notes?: string | null;
  source: Source; confirmationStatus: ConfirmationStatus; durationMinutes?: number | null;
  metadata?: Record<string, unknown>;
}
export interface CreateRecurringRequirementInput {
  userId: string; courseId: string; title: string; description?: string | null;
  frequency: "daily" | "weekly" | "monthly" | "custom";
  startsOn: string; endsOn?: string | null; configuration?: Record<string, unknown>; source: Source;
}
