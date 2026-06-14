"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type CreateNodeInput } from "@/lib/api";
import type { NodeType } from "@/lib/types";

export const keys = {
  courses: ["courses"] as const,
  tree: (id: string) => ["tree", id] as const,
  preview: (id: string) => ["preview", id] as const,
  schemas: ["schemas"] as const,
};

export function useCourses() {
  return useQuery({ queryKey: keys.courses, queryFn: api.listCourses });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title: string) => api.createCourse(title),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.courses }),
  });
}

export function useDeleteCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.courses }),
  });
}

export function useTree(courseId: string) {
  return useQuery({ queryKey: keys.tree(courseId), queryFn: () => api.getTree(courseId) });
}

export function useSchemas() {
  return useQuery({ queryKey: keys.schemas, queryFn: api.getSchemas, staleTime: 5 * 60 * 1000 });
}

export function usePreview(courseId: string) {
  return useQuery({ queryKey: keys.preview(courseId), queryFn: () => api.getPreview(courseId) });
}

function useTreeInvalidation(courseId: string) {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: keys.tree(courseId) });
    qc.invalidateQueries({ queryKey: keys.preview(courseId) });
  };
}

export function useCreateNode(courseId: string) {
  const invalidate = useTreeInvalidation(courseId);
  return useMutation({
    mutationFn: ({ type, input }: { type: NodeType; input: CreateNodeInput }) => api.createNode(type, input),
    onSuccess: invalidate,
  });
}

export function useUpdateNode(courseId: string) {
  const invalidate = useTreeInvalidation(courseId);
  return useMutation({
    mutationFn: ({ type, id, patch }: { type: NodeType; id: string; patch: Record<string, unknown> }) =>
      api.updateNode(type, id, patch),
    onSuccess: invalidate,
  });
}

export function useDeleteNode(courseId: string) {
  const invalidate = useTreeInvalidation(courseId);
  return useMutation({
    mutationFn: ({ type, id }: { type: NodeType; id: string }) => api.deleteNode(type, id),
    onSuccess: invalidate,
  });
}

export function useReorder(courseId: string) {
  const invalidate = useTreeInvalidation(courseId);
  return useMutation({
    mutationFn: ({ type, orderedIds }: { type: NodeType; orderedIds: string[] }) => api.reorder(type, orderedIds),
    onSuccess: invalidate,
  });
}
