"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { useTree } from "@/features/queries";
import { useEditorStore } from "@/features/editor-store";
import { StructureTree } from "./StructureTree";
import { PageCanvas } from "./PageCanvas";
import { PropertyPanel } from "./PropertyPanel";
import { findPage } from "./tree-utils";

export function EditorShell({ courseId }: { courseId: string }) {
  const { data: tree, isLoading, isError } = useTree(courseId);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const clearSelection = useEditorStore((s) => s.clear);

  // Default to the first page; keep valid as the tree changes.
  useEffect(() => {
    if (!tree) return;
    const ids = tree.contentObjects.map((p) => p.id);
    if (activePageId && ids.includes(activePageId)) return;
    setActivePageId(ids[0] ?? null);
  }, [tree, activePageId]);

  useEffect(() => () => clearSelection(), [clearSelection]);

  if (isLoading) return <CenterMessage>Loading course…</CenterMessage>;
  if (isError || !tree) return <CenterMessage>Could not load this course.</CenterMessage>;

  const activePage = activePageId ? findPage(tree, activePageId) : null;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft size={15} /> Projects
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-900">{tree.course.title}</span>
        </div>
        <Link
          href={`/courses/${courseId}/preview`}
          className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <Eye size={15} /> Preview
        </Link>
      </header>

      <div className="flex min-h-0 flex-1">
        <StructureTree tree={tree} courseId={courseId} activePageId={activePageId} onSelectPage={setActivePageId} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
          {activePage ? (
            <PageCanvas page={activePage} courseId={courseId} />
          ) : (
            <CenterMessage>Create or select a page to start authoring.</CenterMessage>
          )}
        </main>
        <PropertyPanel tree={tree} courseId={courseId} />
      </div>
    </div>
  );
}

function CenterMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center p-8 text-sm text-slate-400">{children}</div>;
}
