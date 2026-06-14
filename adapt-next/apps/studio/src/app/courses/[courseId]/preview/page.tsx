import { PreviewScreen } from "@/features/editor/PreviewScreen";

export default async function PreviewPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  return <PreviewScreen courseId={courseId} />;
}
