"use client";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCreateNode, useDeleteNode, useReorder } from "@/features/queries";
import { useEditorStore } from "@/features/editor-store";
import type { ArticleNode, BlockNode, ComponentNode, ContentObjectNode, NodeType } from "@/lib/types";
import { ComponentPicker } from "./ComponentPicker";

export function PageCanvas({ page, courseId }: { page: ContentObjectNode; courseId: string }) {
  const createNode = useCreateNode(courseId);
  const select = useEditorStore((s) => s.select);
  const selection = useEditorStore((s) => s.selection);

  const isSelected = (type: NodeType, id: string) => selection?.type === type && selection.id === id;

  const addArticle = () =>
    createNode.mutate({ type: "article", input: { courseId, parentId: page.id, title: "New article" } });

  return (
    <div className="mx-auto max-w-3xl p-6">
      <button
        onClick={() => select({ type: "contentobject", id: page.id })}
        className={cn(
          "mb-4 block w-full rounded-md border px-4 py-3 text-left",
          isSelected("contentobject", page.id) ? "border-slate-900 bg-white" : "border-slate-200 bg-white hover:border-slate-300",
        )}
      >
        <span className="text-xs uppercase tracking-wide text-slate-400">Page</span>
        <div className="text-lg font-semibold text-slate-900">{page.title}</div>
      </button>

      {page.articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          courseId={courseId}
          selected={isSelected("article", article.id)}
          onSelect={() => select({ type: "article", id: article.id })}
        />
      ))}

      <button
        onClick={addArticle}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
      >
        <Plus size={15} /> Add article
      </button>
    </div>
  );
}

function ArticleCard({
  article,
  courseId,
  selected,
  onSelect,
}: {
  article: ArticleNode;
  courseId: string;
  selected: boolean;
  onSelect: () => void;
}) {
  const createNode = useCreateNode(courseId);
  const deleteNode = useDeleteNode(courseId);
  const addBlock = () =>
    createNode.mutate({ type: "block", input: { courseId, parentId: article.id, title: "New block" } });

  return (
    <section className={cn("mb-4 rounded-lg border bg-slate-50/50 p-3", selected ? "border-slate-900" : "border-slate-200")}>
      <Header
        label="Article"
        title={article.title}
        onSelect={onSelect}
        onDelete={() => deleteNode.mutate({ type: "article", id: article.id })}
      />
      <div className="mt-2 space-y-3">
        {article.blocks.map((block) => (
          <BlockCard key={block.id} block={block} courseId={courseId} />
        ))}
      </div>
      <button
        onClick={addBlock}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-slate-300 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-white"
      >
        <Plus size={13} /> Add block
      </button>
    </section>
  );
}

function BlockCard({ block, courseId }: { block: BlockNode; courseId: string }) {
  const deleteNode = useDeleteNode(courseId);
  const reorder = useReorder(courseId);
  const select = useEditorStore((s) => s.select);
  const selection = useEditorStore((s) => s.selection);

  const moveComponent = (index: number, dir: -1 | 1) => {
    const ids = block.components.map((c) => c.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j] as string, ids[index] as string];
    reorder.mutate({ type: "component", orderedIds: ids });
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-2.5">
      <Header
        label="Block"
        title={block.title}
        onSelect={() => select({ type: "block", id: block.id })}
        onDelete={() => deleteNode.mutate({ type: "block", id: block.id })}
      />
      <div className="mt-2 grid grid-cols-2 gap-2">
        {block.components.map((component, index) => (
          <ComponentCard
            key={component.id}
            component={component}
            selected={selection?.type === "component" && selection.id === component.id}
            onSelect={() => select({ type: "component", id: component.id })}
            onDelete={() => deleteNode.mutate({ type: "component", id: component.id })}
            onMoveUp={() => moveComponent(index, -1)}
            onMoveDown={() => moveComponent(index, 1)}
          />
        ))}
      </div>
      <div className="mt-2">
        <ComponentPicker blockId={block.id} courseId={courseId} />
      </div>
    </div>
  );
}

function ComponentCard({
  component,
  selected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  component: ComponentNode;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <div
      className={cn(
        "group flex flex-col rounded-md border p-2 text-sm",
        component.layout === "full" ? "col-span-2" : "col-span-1",
        selected ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-300",
      )}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
          {component.component} · {component.layout}
        </span>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
          <Mini title="Move up" onClick={onMoveUp}>
            <ChevronUp size={13} />
          </Mini>
          <Mini title="Move down" onClick={onMoveDown}>
            <ChevronDown size={13} />
          </Mini>
          <Mini title="Delete" onClick={onDelete}>
            <Trash2 size={13} />
          </Mini>
        </div>
      </div>
      <button onClick={onSelect} className="truncate text-left font-medium text-slate-800">
        {component.title || "(untitled)"}
      </button>
    </div>
  );
}

function Header({
  label,
  title,
  onSelect,
  onDelete,
}: {
  label: string;
  title: string;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex items-center justify-between">
      <button onClick={onSelect} className="flex items-baseline gap-2 text-left">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">{label}</span>
        <span className="font-medium text-slate-800">{title}</span>
      </button>
      <button
        onClick={onDelete}
        title={`Delete ${label.toLowerCase()}`}
        className="rounded p-1 text-slate-400 opacity-0 hover:bg-slate-100 hover:text-red-600 group-hover:opacity-100"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Mini({ children, onClick, title }: { children: React.ReactNode; onClick: () => void; title: string }) {
  return (
    <button onClick={onClick} title={title} className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
      {children}
    </button>
  );
}
