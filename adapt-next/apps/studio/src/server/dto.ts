import { z } from "zod";
import { ApiError } from "./http";

export const NodeTypeSchema = z.enum(["contentobject", "article", "block", "component"]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export function assertNodeType(raw: string): NodeType {
  const result = NodeTypeSchema.safeParse(raw);
  if (!result.success) throw new ApiError(400, `Unknown content type: ${raw}`);
  return result.data;
}

export const LayoutSchema = z.enum(["full", "left", "right"]);
export const KindSchema = z.enum(["menu", "page"]);

export const createCourseSchema = z.object({
  title: z.string().min(1).default("New course"),
});

export const updateCourseSchema = z.object({
  title: z.string().optional(),
  displayTitle: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  classes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateConfigSchema = z.object({
  theme: z.string().optional(),
  menu: z.string().optional(),
  defaultLanguage: z.string().optional(),
  defaultDirection: z.enum(["ltr", "rtl"]).optional(),
  themeSettings: z.record(z.unknown()).optional(),
});

export const updateAssetSchema = z.object({
  title: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const createTagSchema = z.object({
  name: z.string().min(1),
});

export const createNodeSchema = z.object({
  courseId: z.string().min(1),
  parentId: z.string().nullable().optional(),
  kind: KindSchema.optional(),
  component: z.string().optional(),
  layout: LayoutSchema.optional(),
  title: z.string().optional(),
  displayTitle: z.string().optional(),
  body: z.string().optional(),
  properties: z.record(z.unknown()).optional(),
});
export type CreateNodeInput = z.infer<typeof createNodeSchema>;

export const updateNodeSchema = z.object({
  title: z.string().optional(),
  displayTitle: z.string().nullable().optional(),
  body: z.string().nullable().optional(),
  classes: z.string().optional(),
  isOptional: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
  layout: LayoutSchema.optional(),
  kind: KindSchema.optional(),
  properties: z.record(z.unknown()).optional(),
});
export type UpdateNodeInput = z.infer<typeof updateNodeSchema>;

export const reorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

export const moveSchema = z.object({
  newParentId: z.string().nullable(),
  sortOrder: z.number().int().min(1),
});
