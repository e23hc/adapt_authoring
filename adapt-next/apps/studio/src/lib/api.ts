import type {
  AnyNode,
  CourseInfo,
  CourseSummary,
  EditorTree,
  Layout,
  NodeType,
  SchemasResponse,
} from "./types";
import type { PublishedCourse } from "@adapt-next/renderer";

export interface ApiErrorShape extends Error {
  status?: number;
  details?: unknown;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  const json = (await res.json().catch(() => ({}))) as { data?: T; error?: string; details?: unknown };
  if (!res.ok) {
    const err = new Error(json.error || res.statusText) as ApiErrorShape;
    err.status = res.status;
    err.details = json.details;
    throw err;
  }
  return json.data as T;
}

export interface CreateNodeInput {
  courseId: string;
  parentId?: string | null;
  kind?: "menu" | "page";
  component?: string;
  layout?: Layout;
  title?: string;
}

export const api = {
  listCourses: () => request<CourseSummary[]>("/api/courses"),
  createCourse: (title: string) =>
    request<CourseInfo>("/api/courses", { method: "POST", body: JSON.stringify({ title }) }),
  deleteCourse: (id: string) => request<{ id: string }>(`/api/courses/${id}`, { method: "DELETE" }),

  getTree: (courseId: string) => request<EditorTree>(`/api/courses/${courseId}/tree`),
  getPreview: (courseId: string) => request<PublishedCourse>(`/api/courses/${courseId}/preview`),
  getSchemas: () => request<SchemasResponse>("/api/schemas"),

  createNode: (type: NodeType, input: CreateNodeInput) =>
    request<AnyNode>(`/api/content/${type}`, { method: "POST", body: JSON.stringify(input) }),
  updateNode: (type: NodeType, id: string, patch: Record<string, unknown>) =>
    request<AnyNode>(`/api/content/${type}/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deleteNode: (type: NodeType, id: string) =>
    request<{ id: string }>(`/api/content/${type}/${id}`, { method: "DELETE" }),
  reorder: (type: NodeType, orderedIds: string[]) =>
    request<unknown>(`/api/content/${type}/reorder`, { method: "POST", body: JSON.stringify({ orderedIds }) }),
  move: (type: NodeType, id: string, newParentId: string | null, sortOrder: number) =>
    request<AnyNode>(`/api/content/${type}/${id}/move`, {
      method: "POST",
      body: JSON.stringify({ newParentId, sortOrder }),
    }),
};
