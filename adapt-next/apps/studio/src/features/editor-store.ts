"use client";
import { create } from "zustand";
import type { NodeType } from "@/lib/types";

export interface Selection {
  type: NodeType;
  id: string;
}

interface EditorState {
  selection: Selection | null;
  select: (selection: Selection) => void;
  clear: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  selection: null,
  select: (selection) => set({ selection }),
  clear: () => set({ selection: null }),
}));
