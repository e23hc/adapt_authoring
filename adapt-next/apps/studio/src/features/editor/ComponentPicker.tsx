"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useCreateNode, useSchemas } from "@/features/queries";
import { useEditorStore } from "@/features/editor-store";
import type { ComponentNode } from "@/lib/types";

export function ComponentPicker({ blockId, courseId }: { blockId: string; courseId: string }) {
  const [open, setOpen] = useState(false);
  const { data: schemas } = useSchemas();
  const createNode = useCreateNode(courseId);
  const select = useEditorStore((s) => s.select);

  const pick = (key: string) => {
    setOpen(false);
    createNode.mutate(
      { type: "component", input: { courseId, parentId: blockId, component: key } },
      { onSuccess: (node) => select({ type: "component", id: (node as ComponentNode).id }) },
    );
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-dashed border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
      >
        <Plus size={13} /> Component
      </button>
      {open ? (
        <div className="absolute z-10 mt-1 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
          {schemas?.components.map((c) => (
            <button
              key={c.key}
              onClick={() => pick(c.key)}
              className="block w-full px-3 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              {c.displayName}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
