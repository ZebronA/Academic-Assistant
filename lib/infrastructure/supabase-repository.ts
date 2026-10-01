import type { AcademicRepository } from "@/lib/application/ports";
import type {
  CreateAcademicPeriodInput, CreateAssessmentInput, CreateCourseInput,
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
  async getCurrentAcademicPeriod(userId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("academic_periods")
      .select("*")
      .eq("user_id", userId)
      .eq("is_current", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async createAcademicPeriod(input: CreateAcademicPeriodInput) {
    await requireCurrentUser(this.client, input.userId);
    const { data, error } = await this.client
      .rpc("create_current_academic_period", {
        p_name: input.name.trim(),
        p_academic_year: input.academicYear.trim(),
        p_semester: input.semester,
        p_starts_on: input.startsOn,
        p_ends_on: input.endsOn,
      });
    if (error) throw new Error(error.message);
    return data;
  }

  async listCourses(userId: string, academicPeriodId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .eq("academic_period_id", academicPeriodId)
      .eq("is_active", true)
      .order("code", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async createCourse(input: CreateCourseInput) {
    await requireCurrentUser(this.client, input.userId);
    const { data, error } = await this.client
      .from("courses")
      .insert({
        user_id: input.userId,
        academic_period_id: input.academicPeriodId,
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        course_type: input.courseType,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async updateCourse(input: { userId: string; courseId: string; code: string; name: string; courseType: CreateCourseInput["courseType"] }) {
    await requireCurrentUser(this.client, input.userId);
    const { data, error } = await this.client
      .from("courses")
      .update({
        code: input.code.trim().toUpperCase(),
        name: input.name.trim(),
        course_type: input.courseType,
      })
      .eq("id", input.courseId)
      .eq("user_id", input.userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async archiveCourse(userId: string, courseId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("courses")
      .update({ is_active: false })
      .eq("id", courseId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async listCourseStates(userId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("course_states")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async listUpcomingAssessments(userId: string, academicPeriodId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("assessments")
      .select("*, courses!assessments_course_id_fkey(code,name,academic_period_id)")
      .eq("user_id", userId)
      .eq("courses.academic_period_id", academicPeriodId)
      .in("status", ["upcoming", "in_progress"])
      .order("due_at", { ascending: true, nullsFirst: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }

  async listOpenTasks(userId: string) {
    await requireCurrentUser(this.client, userId);
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["pending", "in_progress"])
      .order("due_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  }
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
