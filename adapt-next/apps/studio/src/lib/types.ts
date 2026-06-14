import type { ComponentSchema, PropSchema } from "@adapt-next/content-schemas";

export type NodeType = "contentobject" | "article" | "block" | "component";
export type Layout = "full" | "left" | "right";
export type Kind = "menu" | "page";

export interface BaseNode {
  id: string;
  courseId: string;
  sortOrder: number;
  title: string;
  displayTitle: string | null;
  body: string | null;
  classes: string;
  isOptional: boolean;
  isAvailable: boolean;
}

export interface ComponentNode extends BaseNode {
  type: "component";
  blockId: string;
  component: string;
  layout: Layout;
  properties: Record<string, unknown>;
}
export interface BlockNode extends BaseNode {
  type: "block";
  articleId: string;
  components: ComponentNode[];
}
export interface ArticleNode extends BaseNode {
  type: "article";
  pageId: string;
  blocks: BlockNode[];
}
export interface ContentObjectNode extends BaseNode {
  type: "contentobject";
  kind: Kind;
  parentObjectId: string | null;
  articles: ArticleNode[];
  children: ContentObjectNode[];
}

export type AnyNode = ContentObjectNode | ArticleNode | BlockNode | ComponentNode;

export interface CourseConfig {
  id: string;
  theme: string;
  menu: string;
  defaultLanguage: string;
  defaultDirection: string;
}
export interface CourseInfo {
  id: string;
  title: string;
  displayTitle: string | null;
  body: string | null;
  config: CourseConfig | null;
}
export interface EditorTree {
  course: CourseInfo;
  contentObjects: ContentObjectNode[];
}

export interface CourseSummary {
  id: string;
  title: string;
  displayTitle: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface ComponentTypeInfo {
  key: string;
  name: string;
  displayName: string;
  icon?: string;
  schema: ComponentSchema;
  defaults: Record<string, unknown>;
}
export interface SchemasResponse {
  components: ComponentTypeInfo[];
  nodeSchemas: Record<string, PropSchema>;
}
