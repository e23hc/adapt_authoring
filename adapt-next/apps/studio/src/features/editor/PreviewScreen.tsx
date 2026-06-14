"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CourseRenderer } from "@adapt-next/renderer";
import { usePreview } from "@/features/queries";

export function PreviewScreen({ courseId }: { courseId: string }) {
  const { data: course, isLoading, isError } = usePreview(courseId);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-2.5 backdrop-blur">
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={15} /> Back to editor
        </Link>
        <span className="text-xs uppercase tracking-wide text-slate-400">Live preview</span>
      </header>
      <div className="mx-auto max-w-3xl px-6 py-8">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : isError || !course ? (
          <p className="text-sm text-slate-400">Could not load preview.</p>
        ) : (
          <CourseRenderer
            course={course}
            options={{
              mode: "preview",
              onComplete: (id, result) => console.log("complete", id, result),
            }}
          />
        )}
      </div>
    </div>
  );
}
