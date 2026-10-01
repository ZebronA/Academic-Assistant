import type {
  CreateAssessmentInput, CreateObservationInput, CreateRecurringRequirementInput,
  CreateTaskInput, RecordAcademicEventInput, RecordStudySessionInput,
} from "@/lib/domain/types";

export interface AcademicRepository {
  listOpenTasks(userId: string): Promise<unknown[]>;
  createTask(input: CreateTaskInput): Promise<unknown>;
  completeTask(userId: string, taskId: string, completedAt: string): Promise<unknown>;
  createAssessment(input: CreateAssessmentInput): Promise<unknown>;
  completeAssessment(userId: string, assessmentId: string): Promise<unknown>;
  createObservation(input: CreateObservationInput): Promise<unknown>;
  recordStudySession(input: RecordStudySessionInput): Promise<unknown>;
  recordAcademicEvent(input: RecordAcademicEventInput): Promise<unknown>;
  createRecurringRequirement(input: CreateRecurringRequirementInput): Promise<unknown>;
}
