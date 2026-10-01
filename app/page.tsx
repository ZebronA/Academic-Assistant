"use client";

import { FormEvent, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/client";
import { SupabaseAcademicRepository } from "@/lib/infrastructure/supabase-repository";
import { completeTask, createTask } from "@/lib/application/commands";

type Task = {
  id: string;
  title: string;
  description: string | null;
  task_type: string;
  estimated_minutes: number | null;
  due_at: string | null;
  status: string;
};

const client = getSupabaseClient();
const repository = new SupabaseAcademicRepository(client);

export default function Home() {
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadTasks(id: string) {
    const data = await repository.listOpenTasks(id);
    setTasks(data as Task[]);
  }

  useEffect(() => {
    client.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        await loadTasks(data.user.id);
      }
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      const id = session?.user.id ?? null;
      setUserId(id);
      if (id) void loadTasks(id);
      else setTasks([]);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const { error } = await client.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    setMessage(error ? error.message : "Check your email for the sign-in link.");
    setBusy(false);
  }

  async function addTask(event: FormEvent) {
    event.preventDefault();
    if (!userId || !title.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      await createTask(repository, {
        userId,
        title,
        taskType: "study",
        estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : null,
        dueAt: dueAt ? new Date(dueAt).toISOString() : null,
        source: "user",
      });
      setTitle("");
      setEstimatedMinutes("");
      setDueAt("");
      await loadTasks(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create task.");
    } finally {
      setBusy(false);
    }
  }

  async function finishTask(taskId: string) {
    if (!userId) return;
    setBusy(true);
    setMessage("");
    try {
      await completeTask(repository, { userId, taskId });
      await loadTasks(userId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not complete task.");
    } finally {
      setBusy(false);
    }
  }

  if (!userId) {
    return (
      <main className="min-h-screen bg-zinc-950 px-6 py-16 text-zinc-100">
        <div className="mx-auto max-w-md">
          <p className="mb-3 text-sm font-medium text-zinc-400">ACADEMIC ASSISTANT</p>
          <h1 className="text-4xl font-semibold tracking-tight">What matters now?</h1>
          <p className="mt-4 leading-7 text-zinc-400">
            Sign in to access your academic state and next-action workspace.
          </p>
          <form onSubmit={signIn} className="mt-8 space-y-3">
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none focus:border-zinc-400"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button disabled={busy} className="w-full rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50">
              {busy ? "Sending..." : "Send sign-in link"}
            </button>
          </form>
          {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-zinc-500">ACADEMIC ASSISTANT</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">What matters now?</h1>
            <p className="mt-2 text-zinc-400">MVP task loop: record work, complete it, and keep academic reality current.</p>
          </div>
          <button onClick={() => client.auth.signOut()} className="text-sm text-zinc-400 hover:text-white">Sign out</button>
        </header>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
          <h2 className="text-lg font-medium">Add a task</h2>
          <form onSubmit={addTask} className="mt-4 grid gap-3 md:grid-cols-[1fr_130px_190px_auto]">
            <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" type="number" min="1" placeholder="Minutes" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} />
            <input className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            <button disabled={busy} className="rounded-xl bg-white px-4 py-3 font-medium text-zinc-950 disabled:opacity-50">Add</button>
          </form>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Open work</h2>
            <span className="text-sm text-zinc-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
          </div>
          <div className="mt-3 space-y-3">
            {tasks.map((task) => (
              <article key={task.id} className="flex items-center justify-between gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {task.task_type}{task.estimated_minutes ? ` · ${task.estimated_minutes} min` : ""}
                    {task.due_at ? ` · due ${new Date(task.due_at).toLocaleString()}` : ""}
                  </p>
                </div>
                <button onClick={() => finishTask(task.id)} disabled={busy} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50">
                  Complete
                </button>
              </article>
            ))}
            {tasks.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">No open tasks yet.</div>}
          </div>
        </section>
        {message && <p className="mt-6 text-sm text-zinc-400">{message}</p>}
      </div>
    </main>
  );
}
