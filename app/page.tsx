"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SupabaseAcademicRepository } from "@/lib/infrastructure/supabase-repository";
import { createAcademicPeriod, createCourse, createTask, completeTask } from "@/lib/application/commands";

type Period = { id: string; name: string; starts_on: string; ends_on: string };
type CourseType = "technical" | "conceptual" | "practical" | "mathematical" | "online" | "mixed";
type Course = { id: string; code: string; name: string; course_type: CourseType };
type State = { course_id: string; state: string; backlog: boolean; understanding_level: number | null; state_reason: string | null };
type Task = { id: string; title: string; course_id: string | null; task_type: string; estimated_minutes: number | null; due_at: string | null; status: string };
type Assessment = { id: string; title: string; course_id: string; assessment_type: string; due_at: string | null; weight_percent: number | null; courses?: { code: string; name: string } };

const client = getSupabaseClient();
const repository = new SupabaseAcademicRepository(client);

function daysUntil(value: string | null) {
  if (!value) return null;
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}

function stateLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [periodName, setPeriodName] = useState("Semester 1 — 2026");
  const [periodStart, setPeriodStart] = useState("2026-09-01");
  const [periodEnd, setPeriodEnd] = useState("2026-12-31");
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseType, setCourseType] = useState<CourseType>("mixed");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadAcademicData(id: string) {
    const current = await repository.getCurrentAcademicPeriod(id) as Period | null;
    setPeriod(current);
    if (!current) {
      setCourses([]); setStates([]); setTasks([]); setAssessments([]);
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
      if (id) void loadAcademicData(id);
      else {
        setPeriod(null); setCourses([]); setStates([]); setTasks([]); setAssessments([]);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(), options: { emailRedirectTo: window.location.origin },
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
    setBusy(false);
  }

  async function setupPeriod(event: FormEvent) {
    event.preventDefault(); if (!userId) return;
    setBusy(true); setMessage("");
    try {
      await createAcademicPeriod(repository, { userId, name: periodName, startsOn: periodStart, endsOn: periodEnd });
      await loadAcademicData(userId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create academic period."); }
    finally { setBusy(false); }
  }

  async function addCourse(event: FormEvent) {
    event.preventDefault(); if (!userId || !period) return;
    setBusy(true); setMessage("");
    try {
      await createCourse(repository, { userId, academicPeriodId: period.id, code: courseCode, name: courseName, courseType: courseType as Course["course_type"] });
      setCourseCode(""); setCourseName("");
      await loadAcademicData(userId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not add course."); }
    finally { setBusy(false); }
  }

  async function addTask(event: FormEvent) {
    event.preventDefault(); if (!userId || !title.trim()) return;
    setBusy(true); setMessage("");
    try {
      await createTask(repository, {
        userId, courseId: courseId || null, title, taskType: "study",
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null, source: "user",
      });
      setTitle(""); setCourseId(""); setEstimatedMinutes(""); setDueAt("");
      await loadAcademicData(userId);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not create task."); }
    finally { setBusy(false); }
  }

  async function finishTask(id: string) {
    if (!userId) return;
    setBusy(true); setMessage("");
    try { await completeTask(repository, { userId, taskId: id }); await loadAcademicData(userId); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not complete task."); }
    finally { setBusy(false); }
  }

  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);
  const stateByCourse = useMemo(() => new Map(states.map((state) => [state.course_id, state])), [states]);

  const nextAction = useMemo(() => {
    const candidates = [
      ...tasks.map((task) => ({ kind: "task" as const, item: task, due: task.due_at, course: task.course_id ? courseById.get(task.course_id) : undefined })),
      ...assessments.map((assessment) => ({ kind: "assessment" as const, item: assessment, due: assessment.due_at, course: courseById.get(assessment.course_id) })),
    ];
    return candidates.map((candidate) => {
      const days = daysUntil(candidate.due);
      const state = candidate.course ? stateByCourse.get(candidate.course.id)?.state : null;
      const urgency = days == null ? 0 : days <= 0 ? 100 : days <= 1 ? 90 : days <= 3 ? 70 : days <= 7 ? 45 : 10;
      const stateBoost = state === "critical" ? 35 : state === "weak" ? 25 : state === "cooling" ? 15 : state === "protected" ? 10 : 0;
      return { ...candidate, score: urgency + stateBoost, days };
    }).sort((a, b) => b.score - a.score)[0] ?? null;
  }, [tasks, assessments, courseById, stateByCourse]);

  if (!userId) return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100"><div className="mx-auto max-w-md">
      <p className="mb-3 text-sm font-medium text-zinc-400">ACADEMIC ASSISTANT</p>
      <h1 className="text-4xl font-semibold tracking-tight">What matters now?</h1>
      <p className="mt-4 leading-7 text-zinc-400">Your academic state, obligations, and next useful action in one place.</p>
      <form onSubmit={signIn} className="mt-8 space-y-3">
        <input className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50">{busy ? "Sending..." : "Send sign-in link"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
    </div></main>
  );

  if (!period) return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100"><div className="mx-auto max-w-2xl">
      <header><p className="text-sm font-medium text-zinc-500">ACADEMIC ASSISTANT</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">Set up your academic period</h1><p className="mt-3 text-zinc-400">This creates the context in which your courses, obligations, and decisions live.</p></header>
      <form onSubmit={setupPeriod} className="mt-8 space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <input className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3" value={periodName} onChange={(e) => setPeriodName(e.target.value)} placeholder="Academic period name" required />
        <div className="grid gap-4 md:grid-cols-2"><label className="text-sm text-zinc-400">Starts<input className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} required /></label><label className="text-sm text-zinc-400">Ends<input className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} required /></label></div>
        <button disabled={busy} className="rounded-xl bg-white px-5 py-3 font-medium text-zinc-950 disabled:opacity-50">{busy ? "Creating..." : "Create academic period"}</button>
      </form>
      {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
    </div></main>
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100"><div className="mx-auto max-w-6xl">
      <header className="flex items-end justify-between gap-6"><div><p className="text-sm font-medium text-zinc-500">ACADEMIC ASSISTANT</p><h1 className="mt-2 text-4xl font-semibold tracking-tight">What matters now?</h1><p className="mt-2 text-zinc-400">{period.name} · {period.starts_on} to {period.ends_on}</p></div><button onClick={() => client.auth.signOut()} className="text-sm text-zinc-400 hover:text-white">Sign out</button></header>

      <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Next action</p>
        {nextAction ? <div className="mt-3"><h2 className="text-2xl font-semibold">{nextAction.item.title}</h2><p className="mt-2 text-zinc-400">{nextAction.course ? nextAction.course.code + " · " + nextAction.course.name : "Academic work"}{nextAction.days != null ? " · " + (nextAction.days <= 0 ? "due now" : "due in " + nextAction.days + " day" + (nextAction.days === 1 ? "" : "s")) : ""}</p><p className="mt-3 text-sm text-zinc-500">Selected from current open work using deadline pressure and current course-state signals. This is deterministic MVP logic, not an AI judgment.</p></div> : <p className="mt-3 text-zinc-400">No actionable academic work is recorded yet.</p>}
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_.7fr]"><section>
        <div className="flex items-center justify-between"><h2 className="text-lg font-medium">Courses</h2><span className="text-sm text-zinc-500">{courses.length} active</span></div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{courses.map((course) => { const state = stateByCourse.get(course.id); return <article key={course.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-zinc-500">{course.code}</p><h3 className="mt-1 font-medium">{course.name}</h3></div>{state && <span className="rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300">{stateLabel(state.state)}</span>}</div><p className="mt-3 text-sm text-zinc-500">{course.course_type}{state?.backlog ? " · backlog recorded" : ""}</p>{state?.state_reason && <p className="mt-2 text-xs text-zinc-600">{state.state_reason}</p>}</article>; })}{courses.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-800 p-6 text-sm text-zinc-500">No courses yet. Add your first course below.</p>}</div>

        <form onSubmit={addCourse} className="mt-5 rounded-2xl border border-zinc-800 p-5"><h3 className="font-medium">Add course</h3><div className="mt-3 grid gap-3 md:grid-cols-[120px_1fr_150px_auto]"><input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" placeholder="Code" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required /><input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" placeholder="Course name" value={courseName} onChange={(e) => setCourseName(e.target.value)} required /><select className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" value={courseType} onChange={(e) => setCourseType(e.target.value as CourseType)}>{["technical","conceptual","practical","mathematical","online","mixed"].map((x) => <option key={x}>{x}</option>)}</select><button disabled={busy} className="rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50">Add</button></div></form>
      </section>

      <aside><section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"><div className="flex items-center justify-between"><h2 className="font-medium">Upcoming assessments</h2><span className="text-xs text-zinc-500">{assessments.length}</span></div><div className="mt-4 space-y-3">{assessments.slice(0,5).map((a) => <div key={a.id} className="border-b border-zinc-800 pb-3 last:border-0"><p className="text-sm font-medium">{a.title}</p><p className="mt-1 text-xs text-zinc-500">{a.courses?.code ?? "Course"} · {a.due_at ? new Date(a.due_at).toLocaleString() : "No due date"}{a.weight_percent != null ? " · " + a.weight_percent + "%" : ""}</p></div>)}{assessments.length === 0 && <p className="text-sm text-zinc-500">No upcoming assessments recorded.</p>}</div></section>

      <section className="mt-5 rounded-2xl border border-zinc-800 p-5"><h2 className="font-medium">Record work</h2><form onSubmit={addTask} className="mt-4 space-y-3"><input className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} required /><select className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" value={courseId} onChange={(e) => setCourseId(e.target.value)}><option value="">No course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.name}</option>)}</select><div className="grid grid-cols-2 gap-3"><input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" type="number" min="1" placeholder="Minutes" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} /><input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} /></div><button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50">Add task</button></form></section></aside></div>

      <section className="mt-8"><div className="flex items-center justify-between"><h2 className="text-lg font-medium">Open work</h2><span className="text-sm text-zinc-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span></div><div className="mt-3 space-y-3">{tasks.map((task) => <article key={task.id} className="flex items-center justify-between gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5"><div><h3 className="font-medium">{task.title}</h3><p className="mt-1 text-sm text-zinc-500">{task.course_id ? courseById.get(task.course_id)?.code ?? "Course" : "General"} · {task.task_type}{task.estimated_minutes ? " · " + task.estimated_minutes + " min" : ""}{task.due_at ? " · due " + new Date(task.due_at).toLocaleString() : ""}</p></div><button onClick={() => finishTask(task.id)} disabled={busy} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50">Complete</button></article>)}{tasks.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">No open tasks yet.</div>}</div></section>
      {message && <p className="mt-6 text-sm text-zinc-400">{message}</p>}
    </div></main>
  );
}
