import type {
  CreateAcademicPeriodInput,
  CreateAssessmentInput, CreateCourseInput, CreateObservationInput, CreateRecurringRequirementInput,
  CreateTaskInput, RecordAcademicEventInput, RecordStudySessionInput,
} from "@/lib/domain/types";

export interface AcademicRepository {
  getCurrentAcademicPeriod(userId: string): Promise<unknown | null>;
  createAcademicPeriod(input: CreateAcademicPeriodInput): Promise<unknown>;
  listCourses(userId: string, academicPeriodId: string): Promise<unknown[]>;
  createCourse(input: CreateCourseInput): Promise<unknown>;
  listCourseStates(userId: string): Promise<unknown[]>;
  listUpcomingAssessments(userId: string, academicPeriodId: string): Promise<unknown[]>;
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
