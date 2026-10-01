"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SupabaseAcademicRepository } from "@/lib/infrastructure/supabase-repository";
import {
  completeTask,
  createAcademicPeriod,
  createAssessment,
  createCourse,
  updateCourse,
  archiveCourse,
  createTask,
  recordStudySession,
} from "@/lib/application/commands";
import { calculateCourseState } from "@/lib/domain/academic-state-engine";
import { calculateNextAction } from "@/lib/domain/priority-engine";
import type { AssessmentType, CourseState, TaskType } from "@/lib/domain/types";
import { TimetableImport } from "@/components/timetable-import";

type Period = { id: string; name: string; starts_on: string; ends_on: string };
type CourseType = "technical" | "conceptual" | "practical" | "mathematical" | "online" | "mixed";
type Course = { id: string; code: string; name: string; course_type: CourseType };
type State = {
  course_id: string;
  state: string;
  backlog: boolean;
  understanding_level: number | null;
  state_reason: string | null;
  last_practiced_at?: string | null;
};
type Task = {
  id: string;
  title: string;
  course_id: string | null;
  task_type: string;
  estimated_minutes: number | null;
  due_at: string | null;
  status: string;
};
type Assessment = {
  id: string;
  title: string;
  course_id: string;
  assessment_type: string;
  due_at: string | null;
  weight_percent: number | null;
  courses?: { code: string; name: string };
};

const client = getSupabaseClient();
const repository = new SupabaseAcademicRepository(client);

const taskTypes: TaskType[] = ["study", "practice", "assignment", "review", "admin", "other"];
const assessmentTypes: AssessmentType[] = ["quiz", "cat", "exam", "assignment", "practical", "other"];

function daysUntil(value: string | null) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

function stateLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function dueLabel(value: string | null) {
  const days = daysUntil(value);
  if (days == null) return "No deadline";
  if (days <= 0) return "Due now";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function inputClass() {
  return "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-zinc-500";
}

function sectionClass() {
  return "rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5";
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("study");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [dueAt, setDueAt] = useState("");

  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [assessmentCourseId, setAssessmentCourseId] = useState("");
  const [assessmentType, setAssessmentType] = useState<AssessmentType>("cat");
  const [assessmentDueAt, setAssessmentDueAt] = useState("");
  const [assessmentWeight, setAssessmentWeight] = useState("");

  const [periodName, setPeriodName] = useState("Semester 1 — 2026");
  const [periodStart, setPeriodStart] = useState("2026-09-01");
  const [periodEnd, setPeriodEnd] = useState("2026-12-31");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("mixed");
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseCode, setEditingCourseCode] = useState("");
  const [editingCourseName, setEditingCourseName] = useState("");
  const [editingCourseType, setEditingCourseType] = useState<CourseType>("mixed");

  const [sessionCourseId, setSessionCourseId] = useState("");
  const [sessionMinutes, setSessionMinutes] = useState("");
  const [sessionOutcome, setSessionOutcome] = useState("");

  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAcademicData(id: string) {
    const current = (await repository.getCurrentAcademicPeriod(id)) as Period | null;
    setPeriod(current);
    if (!current) {
      setCourses([]);
      setStates([]);
      setTasks([]);
      setAssessments([]);
      return;
    }

    const result = await Promise.all([
      repository.listCourses(id, current.id),
      repository.listCourseStates(id),
      repository.listOpenTasks(id),
      repository.listUpcomingAssessments(id, current.id),
    ]);

    setCourses(result[0] as Course[]);
    setStates(result[1] as State[]);
    setTasks(result[2] as Task[]);
    setAssessments(result[3] as unknown as Assessment[]);
  }

  useEffect(() => {
    client.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        await loadAcademicData(data.user.id);
      }
    });

    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      setUserId(id);

      if (id) {
        void loadAcademicData(id);
      } else {
        setPeriod(null);
        setCourses([]);
        setStates([]);
        setTasks([]);
        setAssessments([]);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setMessage(error ? error.message : "Check your email for the sign-in link.");
    setBusy(false);
  }

  async function setupPeriod(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;

    setBusy(true);
    setMessage("");

    try {
      await createAcademicPeriod(repository, {
        userId,
        name: periodName,
        startsOn: periodStart,
        endsOn: periodEnd,
      });
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create academic period.");
    } finally {
      setBusy(false);
    }
  }

  async function addCourse(event: FormEvent) {
    event.preventDefault();
    if (!userId || !period) return;

    setBusy(true);
    setMessage("");

    try {
      await createCourse(repository, {
        userId,
        academicPeriodId: period.id,
        code: courseCode,
        name: courseName,
        courseType,
      });
      setCourseCode("");
      setCourseName("");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not add course.");
    } finally {
      setBusy(false);
    }
  }

  function startEditingCourse(course: Course) {
    setEditingCourseId(course.id);
    setEditingCourseCode(course.code);
    setEditingCourseName(course.name);
    setEditingCourseType(course.course_type);
    setMessage("");
  }

  function cancelEditingCourse() {
    setEditingCourseId(null);
    setEditingCourseCode("");
    setEditingCourseName("");
    setEditingCourseType("mixed");
  }

  async function saveCourseEdit(event: FormEvent) {
    event.preventDefault();
    if (!userId || !editingCourseId) return;

    setBusy(true);
    setMessage("");

    try {
      await updateCourse(repository, {
        userId,
        courseId: editingCourseId,
        code: editingCourseCode,
        name: editingCourseName,
        courseType: editingCourseType,
      });
      cancelEditingCourse();
      setMessage("Course updated.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update course.");
    } finally {
      setBusy(false);
    }
  }

  async function removeCourse(id: string) {
    if (!userId) return;
    const course = courses.find((item) => item.id === id);
    if (!course) return;
    if (!window.confirm(`Remove ${course.code} from this academic period? Existing academic records will be preserved.`)) return;

    setBusy(true);
    setMessage("");

    try {
      await archiveCourse(repository, { userId, courseId: id });
      if (editingCourseId === id) cancelEditingCourse();
      setMessage("Course removed from the active course list. Existing records were preserved.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not remove course.");
    } finally {
      setBusy(false);
    }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!userId || !title.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      await createTask(repository, {
        userId,
        courseId: courseId || null,
        title,
        taskType,
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        source: "user",
      });

      setTitle("");
      setCourseId("");
      setTaskType("study");
      setEstimatedMinutes("");
      setDueAt("");
      setMessage("Task added.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create task.");
    } finally {
      setBusy(false);
    }
  }

  async function addAssessment(event: FormEvent) {
    event.preventDefault();
    if (!userId || !assessmentCourseId || !assessmentTitle.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      await createAssessment(repository, {
        userId,
        courseId: assessmentCourseId,
        title: assessmentTitle,
        assessmentType,
        dueAt: assessmentDueAt ? new Date(assessmentDueAt).toISOString() : null,
        weightPercent: assessmentWeight ? Number(assessmentWeight) : null,
        notes: null,
      });

      setAssessmentTitle("");
      setAssessmentCourseId("");
      setAssessmentType("cat");
      setAssessmentDueAt("");
      setAssessmentWeight("");
      setMessage("Assessment added.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create assessment.");
    } finally {
      setBusy(false);
    }
  }

  async function saveStudySession(event: FormEvent) {
    event.preventDefault();
    if (!userId || !sessionCourseId || !sessionMinutes) return;

    setBusy(true);
    setMessage("");

    try {
      const minutes = Number(sessionMinutes);
      const endedAt = new Date();
      const startedAt = new Date(endedAt.getTime() - minutes * 60000);

      await recordStudySession(repository, {
        userId,
        courseId: sessionCourseId,
        startedAt: startedAt.toISOString(),
        endedAt: endedAt.toISOString(),
        durationMinutes: minutes,
        outcome: sessionOutcome || null,
        source: "user",
      });

      setSessionCourseId("");
      setSessionMinutes("");
      setSessionOutcome("");
      setMessage("Study evidence recorded. Academic state and next action will recalculate from the new evidence.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not record study session.");
    } finally {
      setBusy(false);
    }
  }

  async function finishTask(id: string) {
    if (!userId) return;

    setBusy(true);
    setMessage("");

    try {
      await completeTask(repository, { userId, taskId: id });
      setMessage("Task completed.");
      await loadAcademicData(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete task.");
    } finally {
      setBusy(false);
    }
  }

  const courseById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const stateByCourse = useMemo(
    () => new Map(states.map((state) => [state.course_id, state])),
    [states],
  );

  const derivedStateByCourse = useMemo(() => {
    const result = new Map<string, State>();

    for (const course of courses) {
      const existing = stateByCourse.get(course.id);
      const courseTasks = tasks.filter((task) => task.course_id === course.id);
      const overdueTasks = courseTasks.filter(
        (task) => task.due_at && Date.parse(task.due_at) <= Date.now(),
      ).length;

      const courseAssessments = assessments.filter(
        (assessment) => assessment.course_id === course.id,
      );

      const dueSoon = courseAssessments.filter(
        (assessment) =>
          assessment.due_at &&
          Date.parse(assessment.due_at) - Date.now() <= 86400000,
      ).length;

      const calculated = calculateCourseState({
        currentState: (existing?.state as CourseState | undefined) ?? null,
        backlog: existing?.backlog ?? false,
        overdueTasks,
        missedAssessments: 0,
        assessmentsDueWithinDays: dueSoon,
        lastPracticeAt: existing?.last_practiced_at,
      });

      result.set(course.id, {
        course_id: course.id,
        state: calculated.state,
        backlog: calculated.backlog,
        understanding_level: existing?.understanding_level ?? null,
        state_reason: calculated.reason,
      });
    }

    return result;
  }, [courses, tasks, assessments, stateByCourse]);

  const nextAction = useMemo(() => {
    const candidates = [
      ...tasks.map((task) => {
        const state = task.course_id
          ? derivedStateByCourse.get(task.course_id) ?? stateByCourse.get(task.course_id)
          : undefined;

        return {
          id: task.id,
          kind: "task" as const,
          title: task.title,
          courseId: task.course_id,
          dueAt: task.due_at,
          estimatedMinutes: task.estimated_minutes,
          state: (state?.state as CourseState | undefined) ?? null,
          backlog: state?.backlog ?? false,
        };
      }),
      ...assessments.map((assessment) => {
        const state =
          derivedStateByCourse.get(assessment.course_id) ?? stateByCourse.get(assessment.course_id);

        return {
          id: assessment.id,
          kind: "assessment" as const,
          title: assessment.title,
          courseId: assessment.course_id,
          dueAt: assessment.due_at,
          estimatedMinutes: null,
          state: (state?.state as CourseState | undefined) ?? null,
          backlog: state?.backlog ?? false,
        };
      }),
    ];

    return calculateNextAction(candidates);
  }, [tasks, assessments, derivedStateByCourse, stateByCourse]);

  const overdueTasks = tasks.filter(
    (task) => task.due_at && Date.parse(task.due_at) <= Date.now(),
  ).length;

  const urgentAssessments = assessments.filter(
    (assessment) =>
      assessment.due_at &&
      Date.parse(assessment.due_at) - Date.now() <= 7 * 86400000,
  ).length;

  const stateCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const state of derivedStateByCourse.values()) {
      counts[state.state] = (counts[state.state] ?? 0) + 1;
    }
    return counts;
  }, [derivedStateByCourse]);

  if (!userId) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-sm font-medium tracking-wide text-zinc-400">
            ACADEMIC ASSISTANT
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">What matters now?</h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Your academic state, obligations, and next useful action in one place.
          </p>

          <form onSubmit={signIn} className="mt-8 space-y-3">
            <input
              className={inputClass()}
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <button
              disabled={busy}
              className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50"
            >
              {busy ? "Sending..." : "Send sign-in link"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
        </div>
      </main>
    );
  }

  if (!period) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
        <div className="mx-auto max-w-2xl">
          <header>
            <p className="text-sm font-medium tracking-wide text-zinc-500">ACADEMIC ASSISTANT</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Set up your academic period
            </h1>
            <p className="mt-3 text-zinc-400">
              This creates the context in which your courses, obligations, and decisions live.
            </p>
          </header>

          <form onSubmit={setupPeriod} className={`${sectionClass()} mt-8 space-y-4`}>
            <input
              className={inputClass()}
              value={periodName}
              onChange={(event) => setPeriodName(event.target.value)}
              placeholder="Academic period name"
              required
            />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm text-zinc-400">
                Starts
                <input
                  className={`${inputClass()} mt-2`}
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                  required
                />
              </label>
              <label className="text-sm text-zinc-400">
                Ends
                <input
                  className={`${inputClass()} mt-2`}
                  type="date"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                  required
                />
              </label>
            </div>

            <button
              disabled={busy}
              className="rounded-xl bg-white px-5 py-3 font-medium text-zinc-950 disabled:opacity-50"
            >
              {busy ? "Creating..." : "Create academic period"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-8 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-zinc-900 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-zinc-500">
              ACADEMIC ASSISTANT
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              What matters now?
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              {period.name} · {period.starts_on} → {period.ends_on}
            </p>
          </div>

          <button
            onClick={() => client.auth.signOut()}
            className="self-start rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white sm:self-auto"
          >
            Sign out
          </button>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            ["Courses", courses.length, "active"],
            ["Open tasks", tasks.length, overdueTasks ? `${overdueTasks} overdue` : "on track"],
            ["Assessments", assessments.length, urgentAssessments ? `${urgentAssessments} within 7 days` : "none within 7 days"],
            ["States", Object.values(stateCounts).reduce((sum, count) => sum + count, 0), "derived from evidence"],
          ].map(([label, value, detail]) => (
            <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-zinc-600">{detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Next action
              </p>

              {nextAction ? (
                <>
                  <h2 className="mt-2 text-2xl font-semibold">{nextAction.title}</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    {nextAction.actionType === "assessment" ? "Assessment" : "Task"}
                    {nextAction.deadline ? ` · ${dueLabel(nextAction.deadline)}` : ""}
                    {nextAction.estimatedMinutes ? ` · ${nextAction.estimatedMinutes} min` : ""}
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                    {nextAction.reason}
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-zinc-500">
                    {nextAction.factors.map((factor) => (
                      <li key={factor}>• {factor}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-xl font-semibold">Nothing needs attention yet.</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Add a task or assessment to give the decision engine something to work with.
                  </p>
                </>
              )}
            </div>

            {nextAction?.actionType === "task" && (
              <button
                onClick={() => void finishTask(nextAction.candidateId)}
                disabled={busy}
                className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
              >
                Mark complete
              </button>
            )}
          </div>

          <p className="mt-5 border-t border-zinc-800 pt-3 text-xs text-zinc-600">
            Decision is deterministic from recorded academic data. It is not an AI judgment.
          </p>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
          <section>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-medium">Courses</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Current academic condition derived from recorded evidence.
                </p>
              </div>
              <span className="text-sm text-zinc-500">{courses.length} active</span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {courses.map((course) => {
                const state =
                  derivedStateByCourse.get(course.id) ?? stateByCourse.get(course.id);

                return editingCourseId === course.id ? (
                  <form
                    key={course.id}
                    onSubmit={saveCourseEdit}
                    className="rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5"
                  >
                    <div className="grid gap-3 md:grid-cols-[120px_1fr_160px]">
                      <input
                        className={inputClass()}
                        value={editingCourseCode}
                        onChange={(event) => setEditingCourseCode(event.target.value.toUpperCase())}
                        placeholder="Code"
                        required
                      />
                      <input
                        className={inputClass()}
                        value={editingCourseName}
                        onChange={(event) => setEditingCourseName(event.target.value)}
                        placeholder="Course name"
                        required
                      />
                      <select
                        className={inputClass()}
                        value={editingCourseType}
                        onChange={(event) => setEditingCourseType(event.target.value as CourseType)}
                      >
                        {["technical", "conceptual", "practical", "mathematical", "online", "mixed"].map(
                          (value) => <option key={value}>{value}</option>,
                        )}
                      </select>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50"
                      >
                        Save changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditingCourse}
                        disabled={busy}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeCourse(course.id)}
                        disabled={busy}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
                      >
                        Remove course
                      </button>
                    </div>
                  </form>
                ) : (
                  <article
                    key={course.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-zinc-500">{course.code}</p>
                        <h3 className="mt-1 font-medium">{course.name}</h3>
                      </div>
                      {state && (
                        <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">
                          {stateLabel(state.state)}
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm text-zinc-500">
                      {course.course_type}
                      {state?.backlog ? " · backlog recorded" : ""}
                    </p>

                    {state?.state_reason && (
                      <p className="mt-2 text-xs leading-5 text-zinc-600">{state.state_reason}</p>
                    )}

                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => startEditingCourse(course)}
                        disabled={busy}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
                      >
                        Edit course
                      </button>
                    </div>
                  </article>
                )
              })}

              {courses.length === 0 && (
                <p className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500 sm:col-span-2">
                  No courses yet. Add your first course below.
                </p>
              )}
            </div>

            <TimetableImport
            userId={userId}
            academicPeriodId={period.id}
            onImported={() => loadAcademicData(userId)}
          />

          <form onSubmit={addCourse} className={`${sectionClass()} mt-4`}>
              <h3 className="font-medium">Add course</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-[110px_1fr_150px_auto]">
                <input
                  className={inputClass()}
                  placeholder="Code"
                  value={courseCode}
                  onChange={(event) => setCourseCode(event.target.value)}
                  required
                />
                <input
                  className={inputClass()}
                  placeholder="Course name"
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  required
                />
                <select
                  className={inputClass()}
                  value={courseType}
                  onChange={(event) => setCourseType(event.target.value as CourseType)}
                >
                  {["technical", "conceptual", "practical", "mathematical", "online", "mixed"].map(
                    (value) => (
                      <option key={value}>{value}</option>
                    ),
                  )}
                </select>
                <button
                  disabled={busy}
                  className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-950 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <section className={sectionClass()}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-medium">Upcoming assessments</h2>
                  <p className="mt-1 text-xs text-zinc-600">The next assessment pressure in the system.</p>
                </div>
                <span className="text-xs text-zinc-500">{assessments.length}</span>
              </div>

              <div className="mt-4 space-y-3">
                {assessments.slice(0, 6).map((assessment) => (
                  <div
                    key={assessment.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3"
                  >
                    <p className="text-sm font-medium">{assessment.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {assessment.courses?.code ?? "Course"} · {assessment.assessment_type}
                    </p>
                    <p className="mt-1 text-xs text-zinc-600">
                      {dueLabel(assessment.due_at)}
                      {assessment.weight_percent != null ? ` · ${assessment.weight_percent}%` : ""}
                    </p>
                  </div>
                ))}

                {assessments.length === 0 && (
                  <p className="text-sm text-zinc-500">No upcoming assessments recorded.</p>
                )}
              </div>
            </section>

            <section className={sectionClass()}>
              <h2 className="font-medium">Add assessment</h2>
              <form onSubmit={addAssessment} className="mt-4 space-y-3">
                <input
                  className={inputClass()}
                  placeholder="Assessment name"
                  value={assessmentTitle}
                  onChange={(event) => setAssessmentTitle(event.target.value)}
                  required
                />
                <select
                  className={inputClass()}
                  value={assessmentCourseId}
                  onChange={(event) => setAssessmentCourseId(event.target.value)}
                  required
                >
                  <option value="">Choose course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} · {course.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className={inputClass()}
                    value={assessmentType}
                    onChange={(event) =>
                      setAssessmentType(event.target.value as AssessmentType)
                    }
                  >
                    {assessmentTypes.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                  <input
                    className={inputClass()}
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    placeholder="Weight %"
                    value={assessmentWeight}
                    onChange={(event) => setAssessmentWeight(event.target.value)}
                  />
                </div>
                <input
                  className={inputClass()}
                  type="datetime-local"
                  value={assessmentDueAt}
                  onChange={(event) => setAssessmentDueAt(event.target.value)}
                />
                <button
                  disabled={busy || courses.length === 0}
                  className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                >
                  Add assessment
                </button>
              </form>
            </section>
          </aside>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className={sectionClass()}>
            <h2 className="font-medium">Record work</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Add something the system should consider when deciding what matters next.
            </p>

            <form onSubmit={addTask} className="mt-4 space-y-3">
              <input
                className={inputClass()}
                placeholder="What needs doing?"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  className={inputClass()}
                  value={courseId}
                  onChange={(event) => setCourseId(event.target.value)}
                >
                  <option value="">No course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} · {course.name}
                    </option>
                  ))}
                </select>

                <select
                  className={inputClass()}
                  value={taskType}
                  onChange={(event) => setTaskType(event.target.value as TaskType)}
                >
                  {taskTypes.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass()}
                  type="number"
                  min="1"
                  placeholder="Minutes"
                  value={estimatedMinutes}
                  onChange={(event) => setEstimatedMinutes(event.target.value)}
                />
                <input
                  className={inputClass()}
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
              </div>

              <button
                disabled={busy}
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-950 disabled:opacity-50"
              >
                Add task
              </button>
            </form>
          </section>

          <section className={sectionClass()}>
            <h2 className="font-medium">Record study evidence</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Log what actually happened. This is evidence, not a claim of mastery.
            </p>

            <form onSubmit={saveStudySession} className="mt-4 space-y-3">
              <select
                className={inputClass()}
                value={sessionCourseId}
                onChange={(event) => setSessionCourseId(event.target.value)}
                required
              >
                <option value="">Choose course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} · {course.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  className={inputClass()}
                  type="number"
                  min="1"
                  placeholder="Minutes"
                  value={sessionMinutes}
                  onChange={(event) => setSessionMinutes(event.target.value)}
                  required
                />
                <input
                  className={inputClass()}
                  placeholder="Outcome (optional)"
                  value={sessionOutcome}
                  onChange={(event) => setSessionOutcome(event.target.value)}
                />
              </div>

              <button
                disabled={busy}
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
              >
                Record study evidence
              </button>
            </form>
          </section>
        </div>

        <section className="mt-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-medium">Open work</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Completing work feeds the academic decision loop.
              </p>
            </div>
            <span className="text-sm text-zinc-500">
              {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{task.title}</h3>
                    {task.due_at && (
                      <span
                        className={
                          daysUntil(task.due_at)! <= 0
                            ? "rounded-full bg-zinc-100 px-2 py-1 text-[11px] font-medium text-zinc-900"
                            : "rounded-full border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400"
                        }
                      >
                        {dueLabel(task.due_at)}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {task.course_id ? courseById.get(task.course_id)?.code ?? "Course" : "General"} ·{" "}
                    {task.task_type}
                    {task.estimated_minutes ? ` · ${task.estimated_minutes} min` : ""}
                  </p>
                </div>

                <button
                  onClick={() => void finishTask(task.id)}
                  disabled={busy}
                  className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
                >
                  Complete
                </button>
              </article>
            ))}

            {tasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center">
                <p className="font-medium">No open tasks.</p>
                <p className="mt-1 text-sm text-zinc-600">
                  Add work above and the priority engine can start using it.
                </p>
              </div>
            )}
          </div>
        </section>

        {message && (
          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
