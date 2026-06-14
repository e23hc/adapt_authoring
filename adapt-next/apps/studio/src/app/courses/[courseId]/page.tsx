import { EditorShell } from "@/features/editor/EditorShell";

export default async function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <EditorShell courseId={courseId} />;
}
