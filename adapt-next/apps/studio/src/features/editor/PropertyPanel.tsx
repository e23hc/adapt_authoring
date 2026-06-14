"use client";
import type { PropSchema } from "@adapt-next/content-schemas";
import { useMemo, useRef, useState } from "react";
import { Trash2, X } from "lucide-react";
import { SchemaForm } from "@/features/form/SchemaForm";
import { useDeleteNode, useSchemas, useUpdateNode } from "@/features/queries";
import { useEditorStore } from "@/features/editor-store";
import type { AnyNode, ComponentNode, EditorTree, NodeType, SchemasResponse } from "@/lib/types";
import { findNode } from "./tree-utils";

export function PropertyPanel({ tree, courseId }: { tree: EditorTree; courseId: string }) {
  const selection = useEditorStore((s) => s.selection);
  const clear = useEditorStore((s) => s.clear);
  const { data: schemas } = useSchemas();

  const node = selection ? findNode(tree, selection.type, selection.id) : null;

  if (!selection || !node || !schemas) {
    return (
      <aside className="flex h-full w-80 shrink-0 items-center justify-center border-l border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
        Select a page, article, block or component to edit its properties.
      </aside>
    );
  }

  return (
    <PropertyForm
      key={node.id}
      node={node}
      type={selection.type}
      schemas={schemas}
      courseId={courseId}
      onClose={clear}
    />
  );
}

const BASE_KEYS = ["title", "displayTitle", "body", "classes", "isOptional", "isAvailable"] as const;

function buildForm(node: AnyNode, type: NodeType, schemas: SchemasResponse) {
  const base = schemas.nodeSchemas[type] as PropSchema;
  const value: Record<string, unknown> = {
    title: node.title ?? "",
    displayTitle: node.displayTitle ?? "",
    body: node.body ?? "",
    classes: node.classes ?? "",
    isOptional: node.isOptional,
    isAvailable: node.isAvailable,
  };

  if (type === "component") {
    const comp = node as ComponentNode;
    value.layout = comp.layout;
    value.properties = comp.properties ?? {};
    const compType = schemas.components.find((c) => c.key === comp.component);
    const merged: PropSchema = {
      type: "object",
      properties: {
        ...(base.properties ?? {}),
        properties: {
          type: "object",
          title: "Properties",
          "x-ui": { widget: "object" },
          properties: compType?.schema.properties ?? {},
        },
      },
    };
    return { schema: merged, initialValue: value };
  }

  return { schema: base, initialValue: value };
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

function PropertyForm({
  node,
  type,
  schemas,
  courseId,
  onClose,
}: {
  node: AnyNode;
  type: NodeType;
  schemas: SchemasResponse;
  courseId: string;
  onClose: () => void;
}) {
  const updateNode = useUpdateNode(courseId);
  const deleteNode = useDeleteNode(courseId);
  const { schema, initialValue } = useMemo(() => buildForm(node, type, schemas), [node, type, schemas]);
  const [value, setValue] = useState(initialValue);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const heading = type === "component" ? `${(node as ComponentNode).component} component` : type;

  const handleChange = (next: Record<string, unknown>) => {
    setValue(next);
    setStatus("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      updateNode.mutate(
        { type, id: node.id, patch: next },
        { onSuccess: () => setStatus("saved"), onError: () => setStatus("error") },
      );
    }, 600);
  };

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-l border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div>
          <div className="text-sm font-semibold capitalize text-slate-800">{heading}</div>
          <div className="text-xs text-slate-400">{statusLabel(status)}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            title="Delete"
            onClick={() => {
              if (confirm(`Delete this ${type}?`)) {
                deleteNode.mutate({ type, id: node.id });
                onClose();
              }
            }}
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
          <button title="Close" onClick={onClose} className="rounded p-1.5 text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        <SchemaForm schema={schema} value={value} onChange={handleChange} />
      </div>
    </aside>
  );
}

function statusLabel(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "All changes saved";
    case "error":
      return "Save failed";
    default:
      return "Editing";
  }
}
