import { DomainValidationError } from "@/lib/application/errors";
import type { AcademicRepository } from "@/lib/application/ports";
import type {
  CompleteAssessmentInput, CompleteTaskInput, CreateAcademicPeriodInput, CreateAssessmentInput,
  CreateCourseInput, CreateObservationInput, CreateRecurringRequirementInput, CreateTaskInput,
  RecordAcademicEventInput, RecordStudySessionInput,
} from "@/lib/domain/types";

function requireText(value: string | null | undefined, field: string) {
  if (!value?.trim()) throw new DomainValidationError(field + " is required");
}
function requirePositiveMinutes(value: number | null | undefined, field: string) {
  if (value == null) return;
  if (!Number.isFinite(value) || value <= 0) throw new DomainValidationError(field + " must be greater than zero");
}
function requireIsoDate(value: string, field: string) {
  if (Number.isNaN(Date.parse(value))) throw new DomainValidationError(field + " must be a valid date");
}

export async function createAcademicPeriod(repo: AcademicRepository, input: CreateAcademicPeriodInput) {
  requireText(input.userId, "userId"); requireText(input.name, "name"); requireText(input.academicYear, "academicYear");
  if (input.semester !== 1 && input.semester !== 2) throw new DomainValidationError("semester must be 1 or 2");
  requireIsoDate(input.startsOn, "startsOn"); requireIsoDate(input.endsOn, "endsOn");
  if (Date.parse(input.endsOn) < Date.parse(input.startsOn)) throw new DomainValidationError("endsOn cannot be before startsOn");
  return repo.createAcademicPeriod(input);
}

export async function createCourse(repo: AcademicRepository, input: CreateCourseInput) {
  requireText(input.userId, "userId"); requireText(input.academicPeriodId, "academicPeriodId");
  requireText(input.code, "code"); requireText(input.name, "name");
  return repo.createCourse(input);
}

export async function updateCourse(
  repo: AcademicRepository,
  input: { userId: string; courseId: string; code: string; name: string; courseType: CreateCourseInput["courseType"] },
) {
  requireText(input.userId, "userId"); requireText(input.courseId, "courseId");
  requireText(input.code, "code"); requireText(input.name, "name");
  return repo.updateCourse(input);
}

export async function archiveCourse(
  repo: AcademicRepository,
  input: { userId: string; courseId: string },
) {
  requireText(input.userId, "userId"); requireText(input.courseId, "courseId");
  return repo.archiveCourse(input.userId, input.courseId);
}

export async function createTask(repo: AcademicRepository, input: CreateTaskInput) {
  requireText(input.userId, "userId"); requireText(input.title, "title");
  requirePositiveMinutes(input.estimatedMinutes, "estimatedMinutes");
  if (input.dueAt) requireIsoDate(input.dueAt, "dueAt");
  return repo.createTask(input);
}
export async function completeTask(repo: AcademicRepository, input: CompleteTaskInput) {
  requireText(input.userId, "userId"); requireText(input.taskId, "taskId");
  const completedAt = input.completedAt ?? new Date().toISOString();
  requireIsoDate(completedAt, "completedAt");
  return repo.completeTask(input.userId, input.taskId, completedAt);
}
export async function createAssessment(repo: AcademicRepository, input: CreateAssessmentInput) {
  requireText(input.userId, "userId"); requireText(input.courseId, "courseId"); requireText(input.title, "title");
  if (input.startsAt) requireIsoDate(input.startsAt, "startsAt");
  if (input.dueAt) requireIsoDate(input.dueAt, "dueAt");
  if (input.weightPercent != null && (!Number.isFinite(input.weightPercent) || input.weightPercent < 0 || input.weightPercent > 100))
    throw new DomainValidationError("weightPercent must be between 0 and 100");
  return repo.createAssessment(input);
}
export async function completeAssessment(repo: AcademicRepository, input: CompleteAssessmentInput) {
  requireText(input.userId, "userId"); requireText(input.assessmentId, "assessmentId");
  return repo.completeAssessment(input.userId, input.assessmentId);
}
export async function createObservation(repo: AcademicRepository, input: CreateObservationInput) {
  requireText(input.userId, "userId"); requireText(input.content, "content");
  if (input.observedAt) requireIsoDate(input.observedAt, "observedAt");
  if (input.confidence != null && (!Number.isFinite(input.confidence) || input.confidence < 0 || input.confidence > 1))
    throw new DomainValidationError("confidence must be between 0 and 1");
  return repo.createObservation(input);
}
export async function recordStudySession(repo: AcademicRepository, input: RecordStudySessionInput) {
  requireText(input.userId, "userId"); requireIsoDate(input.startedAt, "startedAt"); requireIsoDate(input.endedAt, "endedAt");
  const start = Date.parse(input.startedAt), end = Date.parse(input.endedAt);
  if (end < start) throw new DomainValidationError("endedAt cannot be before startedAt");
  const durationMinutes = input.durationMinutes ?? Math.round((end - start) / 60000);
  requirePositiveMinutes(durationMinutes, "durationMinutes");
  return repo.recordStudySession({ ...input, durationMinutes });
}
export async function recordAcademicEvent(repo: AcademicRepository, input: RecordAcademicEventInput) {
  requireText(input.userId, "userId"); requireText(input.eventType, "eventType");
  requireIsoDate(input.occurredAt ?? new Date().toISOString(), "occurredAt");
  requirePositiveMinutes(input.durationMinutes, "durationMinutes");
  return repo.recordAcademicEvent(input);
}
export async function createRecurringRequirement(repo: AcademicRepository, input: CreateRecurringRequirementInput) {
  requireText(input.userId, "userId"); requireText(input.courseId, "courseId"); requireText(input.title, "title");
  requireIsoDate(input.startsOn, "startsOn");
  if (input.endsOn) requireIsoDate(input.endsOn, "endsOn");
  if (input.endsOn && Date.parse(input.endsOn) < Date.parse(input.startsOn))
    throw new DomainValidationError("endsOn cannot be before startsOn");
  return repo.createRecurringRequirement(input);
}
