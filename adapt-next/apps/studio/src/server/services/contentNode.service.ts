import { registry } from "@adapt-next/content-schemas";
import { prisma } from "../db";
import { ApiError } from "../http";
import type { CreateNodeInput, NodeType, UpdateNodeInput } from "../dto";
import { validateComponentProperties } from "./validation.service";

const PARENT_FIELD: Record<NodeType, string> = {
  contentobject: "parentObjectId",
  article: "pageId",
  block: "articleId",
  component: "blockId",
};

const DEFAULT_TITLE: Record<NodeType, string> = {
  contentobject: "New page",
  article: "New article",
  block: "New block",
  component: "New component",
};

// Prisma delegates differ per model; cast to a permissive shape for the shared CRUD logic.
/* eslint-disable @typescript-eslint/no-explicit-any */
function delegate(type: NodeType): any {
  switch (type) {
    case "contentobject":
      return prisma.contentObject;
    case "article":
      return prisma.article;
    case "block":
      return prisma.block;
    case "component":
      return prisma.component;
  }
}

export async function createNode(type: NodeType, input: CreateNodeInput) {
  const parentField = PARENT_FIELD[type];
  const parentId = input.parentId ?? null;

  if (type !== "contentobject" && !parentId) {
    throw new ApiError(400, `${type} requires a parentId`);
  }

  const last = await delegate(type).findFirst({
    where: { courseId: input.courseId, [parentField]: parentId },
    orderBy: { sortOrder: "desc" },
  });
  const sortOrder = (last?.sortOrder ?? 0) + 1;

  const data: Record<string, unknown> = {
    courseId: input.courseId,
    [parentField]: parentId,
    sortOrder,
    title: input.title ?? DEFAULT_TITLE[type],
    displayTitle: input.displayTitle ?? input.title ?? DEFAULT_TITLE[type],
    body: input.body ?? null,
  };

  if (type === "contentobject") {
    data.kind = input.kind ?? "page";
  }

  if (type === "component") {
    const key = input.component;
    if (!key || !registry.has(key)) {
      throw new ApiError(400, `Unknown component type: ${key ?? "(none)"}`);
    }
    data.component = key;
    data.layout = input.layout ?? "full";
    const props = input.properties ?? registry.getDefaults(key);
    data.properties = validateComponentProperties(key, props);
  }

  return delegate(type).create({ data });
}

export async function updateNode(type: NodeType, id: string, patch: UpdateNodeInput) {
  const existing = await delegate(type).findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, `${type} not found`);

  const data: Record<string, unknown> = {};
  for (const field of ["title", "displayTitle", "body", "classes", "isOptional", "isAvailable"] as const) {
    if (field in patch && patch[field] !== undefined) data[field] = patch[field];
  }
  if (type === "contentobject" && patch.kind) data.kind = patch.kind;
  if (type === "component") {
    if (patch.layout) data.layout = patch.layout;
    if (patch.properties !== undefined) {
      data.properties = validateComponentProperties(existing.component, patch.properties);
    }
  }

  return delegate(type).update({ where: { id }, data });
}

export async function deleteNode(type: NodeType, id: string) {
  try {
    await delegate(type).delete({ where: { id } });
  } catch {
    throw new ApiError(404, `${type} not found`);
  }
}

export async function reorderNodes(type: NodeType, orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) => delegate(type).update({ where: { id }, data: { sortOrder: index + 1 } })),
  );
}

export async function moveNode(type: NodeType, id: string, newParentId: string | null, sortOrder: number) {
  const parentField = PARENT_FIELD[type];
  if (type !== "contentobject" && !newParentId) {
    throw new ApiError(400, `${type} requires a parent`);
  }
  return delegate(type).update({
    where: { id },
    data: { [parentField]: newParentId, sortOrder },
  });
}
/* eslint-enable @typescript-eslint/no-explicit-any */
