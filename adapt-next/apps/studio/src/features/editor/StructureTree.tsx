"use client";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { FileText, GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCreateNode, useDeleteNode, useReorder } from "@/features/queries";
import type { ContentObjectNode, EditorTree } from "@/lib/types";

export function StructureTree({
  tree,
  courseId,
  activePageId,
  onSelectPage,
}: {
  tree: EditorTree;
  courseId: string;
  activePageId: string | null;
  onSelectPage: (id: string) => void;
}) {
  const pages = tree.contentObjects;
  const [order, setOrder] = useState<string[]>(pages.map((p) => p.id));
  useEffect(() => setOrder(pages.map((p) => p.id)), [pages]);

  const reorder = useReorder(courseId);
  const createNode = useCreateNode(courseId);
  const deleteNode = useDeleteNode(courseId);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const byId = new Map(pages.map((p) => [p.id, p] as const));
  const ordered = order.map((id) => byId.get(id)).filter((p): p is ContentObjectNode => Boolean(p));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
    setOrder(next); // optimistic
    reorder.mutate({ type: "contentobject", orderedIds: next });
  };

  const addPage = () =>
    createNode.mutate(
      { type: "contentobject", input: { courseId, parentId: null, kind: "page", title: "New page" } },
      { onSuccess: (node) => onSelectPage(node.id) },
    );

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Structure</span>
        <button onClick={addPage} title="Add page" className="rounded p-1 text-slate-500 hover:bg-slate-100">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={order} strategy={verticalListSortingStrategy}>
            {ordered.map((page) => (
              <SortablePage
                key={page.id}
                page={page}
                active={page.id === activePageId}
                onSelect={() => onSelectPage(page.id)}
                onDelete={() => {
                  if (confirm(`Delete page "${page.title}"?`)) deleteNode.mutate({ type: "contentobject", id: page.id });
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
        {ordered.length === 0 ? <p className="px-2 py-3 text-xs text-slate-400">No pages yet.</p> : null}
      </div>
    </div>
  );
}

function SortablePage({
  page,
  active,
  onSelect,
  onDelete,
}: {
  page: ContentObjectNode;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group mb-0.5 flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        className={cn("cursor-grab touch-none", active ? "text-slate-300" : "text-slate-300 group-hover:text-slate-400")}
      >
        <GripVertical size={14} />
      </button>
      <button onClick={onSelect} className="flex flex-1 items-center gap-1.5 truncate text-left">
        <FileText size={14} className="shrink-0 opacity-60" />
        <span className="truncate">{page.title}</span>
      </button>
      <button
        onClick={onDelete}
        title="Delete page"
        className={cn(
          "rounded p-0.5 opacity-0 group-hover:opacity-100",
          active ? "text-slate-300 hover:text-white" : "text-slate-400 hover:text-red-600",
        )}
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
