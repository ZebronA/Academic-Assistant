import type { AcademicRepository } from "@/lib/application/ports";
import type {
  CreateAssessmentInput,
  CreateObservationInput,
  CreateRecurringRequirementInput,
  CreateTaskInput,
  RecordAcademicEventInput,
  RecordStudySessionInput,
} from "@/lib/domain/types";
import { NotFoundError } from "@/lib/application/errors";
import { getSupabaseClient } from "@/lib/supabase/client";

type SupabaseClient = ReturnType<typeof getSupabaseClient>;

async function requireCurrentUser(client: SupabaseClient, expectedUserId: string) {
  const { data, error } = await client.auth.getUser();

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("You must be signed in.");
  if (data.user.id !== expectedUserId) {
    throw new Error("The requested user does not match the signed-in user.");
  }

  return data.user;
}

export class SupabaseAcademicRepository implements AcademicRepository {
  constructor(private readonly client = getSupabaseClient()) {}

  async createTask(input: CreateTaskInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("tasks")
      .insert({
        user_id: input.userId,
        course_id: input.courseId ?? null,
        recurring_requirement_id: input.recurringRequirementId ?? null,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        task_type: input.taskType,
        estimated_minutes: input.estimatedMinutes ?? null,
        due_at: input.dueAt ?? null,
        source: input.source,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async completeTask(userId: string, taskId: string, completedAt: string) {
    await requireCurrentUser(this.client, userId);

    const { data, error } = await this.client
      .from("tasks")
      .update({ status: "completed", completed_at: completedAt })
      .eq("id", taskId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundError("Task not found");

    return data;
  }

  async createAssessment(input: CreateAssessmentInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("assessments")
      .insert({
        user_id: input.userId,
        course_id: input.courseId,
        title: input.title.trim(),
        assessment_type: input.assessmentType,
        starts_at: input.startsAt ?? null,
        due_at: input.dueAt ?? null,
        weight_percent: input.weightPercent ?? null,
        notes: input.notes?.trim() || null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async completeAssessment(userId: string, assessmentId: string) {
    await requireCurrentUser(this.client, userId);

    const { data, error } = await this.client
      .from("assessments")
      .update({ status: "completed" })
      .eq("id", assessmentId)
      .eq("user_id", userId)
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new NotFoundError("Assessment not found");

    return data;
  }

  async createObservation(input: CreateObservationInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("observations")
      .insert({
        user_id: input.userId,
        course_id: input.courseId ?? null,
        task_id: input.taskId ?? null,
        assessment_id: input.assessmentId ?? null,
        content: input.content.trim(),
        observed_at: input.observedAt ?? new Date().toISOString(),
        source: input.source,
        confidence: input.confidence ?? null,
        confirmation_status: input.confirmationStatus,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async recordStudySession(input: RecordStudySessionInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("study_sessions")
      .insert({
        user_id: input.userId,
        course_id: input.courseId ?? null,
        task_id: input.taskId ?? null,
        started_at: input.startedAt,
        ended_at: input.endedAt,
        duration_minutes: input.durationMinutes ?? null,
        outcome: input.outcome?.trim() || null,
        notes: input.notes?.trim() || null,
        source: input.source,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async recordAcademicEvent(input: RecordAcademicEventInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("academic_events")
      .insert({
        user_id: input.userId,
        course_id: input.courseId ?? null,
        task_id: input.taskId ?? null,
        assessment_id: input.assessmentId ?? null,
        event_type: input.eventType,
        occurred_at: input.occurredAt ?? new Date().toISOString(),
        title: input.title?.trim() || input.eventType,
        notes: input.notes?.trim() || null,
        source: input.source,
        confirmation_status: input.confirmationStatus,
        duration_minutes: input.durationMinutes ?? null,
        metadata: input.metadata ?? {},
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async createRecurringRequirement(input: CreateRecurringRequirementInput) {
    await requireCurrentUser(this.client, input.userId);

    const { data, error } = await this.client
      .from("recurring_requirements")
      .insert({
        user_id: input.userId,
        course_id: input.courseId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        frequency: input.frequency,
        starts_on: input.startsOn,
        ends_on: input.endsOn ?? null,
        configuration: input.configuration ?? {},
        source: input.source,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
