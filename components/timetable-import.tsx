"use client";

import { FormEvent, useState } from "react";
import { createCourse } from "@/lib/application/commands";
import { SupabaseAcademicRepository } from "@/lib/infrastructure/supabase-repository";
import { getSupabaseClient } from "@/lib/supabase/client";
import { extractTimetableCourses, type ImportedCourse } from "@/lib/import/timetable";

type CourseType = ImportedCourse["courseType"];

const client = getSupabaseClient();
const repository = new SupabaseAcademicRepository(client);

function inputClass() {
  return "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-zinc-500";
}

export function TimetableImport({
  userId,
  academicPeriodId,
  onImported,
}: {
  userId: string;
  academicPeriodId: string;
  onImported: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [courses, setCourses] = useState<ImportedCourse[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function readTimetable(event: FormEvent) {
    event.preventDefault();
    if (!file) return;

    setBusy(true);
    setMessage("");

    try {
      const extracted = await extractTimetableCourses(file);
      setCourses(extracted);
      setMessage(
        extracted.length
          ? "Review the detected courses before importing them."
          : "No course codes were detected. Try a clearer timetable PDF.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not read the timetable.");
    } finally {
      setBusy(false);
    }
  }

  function updateCourse(index: number, patch: Partial<ImportedCourse>) {
    setCourses((current) =>
      current.map((course, courseIndex) =>
        courseIndex === index ? { ...course, ...patch } : course,
      ),
    );
  }

  function removeCourse(index: number) {
    setCourses((current) => current.filter((_, courseIndex) => courseIndex !== index));
  }

  async function importCourses() {
    if (!courses.length) return;

    setBusy(true);
    setMessage("");

    try {
      for (const course of courses) {
        await createCourse(repository, {
          userId,
          academicPeriodId,
          code: course.code,
          name: course.name,
          courseType: course.courseType,
        });
      }

      setCourses([]);
      setFile(null);
      setMessage("Courses imported. The timetable was used only to establish course information.");
      await onImported();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not import the courses.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Course setup</p>
        <h2 className="mt-2 text-xl font-semibold">Import from timetable</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          The timetable is used to discover courses and delivery information. It does not establish
          attendance, completion, deadlines, academic state, or what actually happened.
        </p>
      </div>

      <form onSubmit={readTimetable} className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="min-w-0 flex-1">
          <label className="block cursor-pointer rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-3 text-sm transition hover:border-zinc-500">
            <span className="block font-medium text-zinc-200">Choose timetable PDF</span>
            <span className="mt-1 block truncate text-xs text-zinc-500">
              {file ? file.name : "No PDF selected"}
            </span>
            <input
              className="sr-only"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0] ?? null;
                setFile(selectedFile);
                setMessage("");
              }}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={busy || !file}
          className="rounded-xl bg-white px-4 py-3 text-sm font-medium text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Reading..." : file ? "Read timetable" : "Choose a PDF first"}
        </button>
      </form>

      {courses.length > 0 && (
        <div className="mt-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="font-medium">Review detected courses</h3>
              <p className="mt-1 text-xs text-zinc-600">
                Correct anything the PDF reader misunderstood before saving.
              </p>
            </div>
            <span className="text-xs text-zinc-500">{courses.length} detected</span>
          </div>

          <div className="mt-4 space-y-3">
            {courses.map((course, index) => (
              <div key={course.code + index} className="grid gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-3 md:grid-cols-[120px_1fr_160px_auto]">
                <input
                  className={inputClass()}
                  value={course.code}
                  onChange={(event) => updateCourse(index, { code: event.target.value.toUpperCase() })}
                  aria-label={"Course code " + (index + 1)}
                />
                <input
                  className={inputClass()}
                  value={course.name}
                  onChange={(event) => updateCourse(index, { name: event.target.value })}
                  aria-label={"Course name " + (index + 1)}
                />
                <select
                  className={inputClass()}
                  value={course.courseType}
                  onChange={(event) =>
                    updateCourse(index, { courseType: event.target.value as CourseType })
                  }
                  aria-label={"Delivery " + (index + 1)}
                >
                  <option value="mixed">Lecture + lab</option>
                  <option value="practical">Lab</option>
                  <option value="conceptual">Lecture</option>
                  <option value="online">Online</option>
                  <option value="technical">Technical</option>
                  <option value="mathematical">Mathematical</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeCourse(index)}
                  className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void importCourses()}
            disabled={busy}
            className="mt-4 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 disabled:opacity-50"
          >
            {busy ? "Importing..." : "Confirm and import " + courses.length + " courses"}
          </button>
        </div>
      )}

      {message && <p className="mt-4 text-sm text-zinc-400">{message}</p>}
    </section>
  );
}
