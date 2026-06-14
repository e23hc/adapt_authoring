"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { cn } from "@/lib/cn";

export function RichTextField({
  value,
  onChange,
  inline = false,
}: {
  value: string;
  onChange: (html: string) => void;
  inline?: boolean;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure(inline ? { heading: false, bulletList: false, orderedList: false } : {})],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: { class: cn("an-prose focus:outline-none", inline ? "min-h-[1.5rem]" : "min-h-[5rem]") },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external value changes (e.g. switching the selected node) without disrupting typing.
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <div className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-within:border-slate-400">
      <EditorContent editor={editor} />
    </div>
  );
}
