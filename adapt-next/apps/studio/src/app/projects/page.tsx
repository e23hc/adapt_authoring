"use client";
import Link from "next/link";
import { useState } from "react";
import { Eye, Plus, Trash2 } from "lucide-react";
import { useCourses, useCreateCourse, useDeleteCourse } from "@/features/queries";

export default function ProjectsPage() {
  const { data: courses, isLoading } = useCourses();
  const createCourse = useCreateCourse();
  const deleteCourse = useDeleteCourse();
  const [title, setTitle] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = title.trim() || "New course";
    createCourse.mutate(name, { onSuccess: () => setTitle("") });
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Adapt Next Studio</h1>
        <p className="text-sm text-slate-500">Schema-driven course authoring</p>
      </header>

      <form onSubmit={submit} className="mb-8 flex gap-2">
        <input
          className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
          placeholder="New course title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          type="submit"
          disabled={createCourse.isPending}
          className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          <Plus size={16} /> Create
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : courses && courses.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <Link href={`/courses/${course.id}`} className="font-medium text-slate-900 hover:underline">
                  {course.title}
                </Link>
                <button
                  title="Delete course"
                  onClick={() => {
                    if (confirm(`Delete "${course.title}"?`)) deleteCourse.mutate(course.id);
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Updated {new Date(course.updatedAt).toLocaleString()}
              </p>
              <div className="mt-3 flex gap-3 text-sm">
                <Link href={`/courses/${course.id}`} className="text-slate-700 hover:underline">
                  Edit
                </Link>
                <Link
                  href={`/courses/${course.id}/preview`}
                  className="inline-flex items-center gap-1 text-slate-500 hover:underline"
                >
                  <Eye size={14} /> Preview
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No courses yet. Create one above.</p>
      )}
    </main>
  );
}
