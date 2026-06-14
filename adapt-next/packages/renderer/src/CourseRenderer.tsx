"use client";
import type { PublishedCourse } from "@adapt-next/content-schemas";
import "./register-builtins";
import { PageRenderer } from "./PageRenderer";
import { RendererProvider, type RendererContextValue } from "./context";

export function CourseRenderer({
  course,
  options,
}: {
  course: PublishedCourse;
  options?: Partial<RendererContextValue>;
}) {
  return (
    <RendererProvider value={options}>
      <div className="an-course" dir={course.config._defaultDirection}>
        {course.pages.length === 0 ? (
          <p className="an-placeholder">This course has no pages yet.</p>
        ) : (
          course.pages.map((p) => <PageRenderer key={p._id} node={p} />)
        )}
      </div>
    </RendererProvider>
  );
}
