import type { Article, Block, Component, ContentObject, Course, CourseConfig } from "@prisma/client";
import { prisma } from "../db";
import { ApiError } from "../http";

export type EditorComponent = Component & { type: "component" };
export type EditorBlock = Block & { type: "block"; components: EditorComponent[] };
export type EditorArticle = Article & { type: "article"; blocks: EditorBlock[] };
export type EditorContentObject = ContentObject & {
  type: "contentobject";
  articles: EditorArticle[];
  children: EditorContentObject[];
};

export interface EditorTree {
  course: Course & { config: CourseConfig | null };
  contentObjects: EditorContentObject[];
}

const ROOT = "__root__";

/** Load the four node tables for a course (one query each) and nest them in memory. */
export async function getCourseTree(courseId: string): Promise<EditorTree> {
  const course = await prisma.course.findUnique({ where: { id: courseId }, include: { config: true } });
  if (!course) throw new ApiError(404, "Course not found");

  const [cos, articles, blocks, components] = await Promise.all([
    prisma.contentObject.findMany({ where: { courseId }, orderBy: { sortOrder: "asc" } }),
    prisma.article.findMany({ where: { courseId }, orderBy: { sortOrder: "asc" } }),
    prisma.block.findMany({ where: { courseId }, orderBy: { sortOrder: "asc" } }),
    prisma.component.findMany({ where: { courseId }, orderBy: { sortOrder: "asc" } }),
  ]);

  const componentsByBlock = groupBy(components, (c) => c.blockId);
  const blocksByArticle = groupBy(blocks, (b) => b.articleId);
  const articlesByPage = groupBy(articles, (a) => a.pageId);
  const cosByParent = groupBy(cos, (c) => c.parentObjectId ?? ROOT);

  const buildArticle = (a: Article): EditorArticle => ({
    ...a,
    type: "article",
    blocks: (blocksByArticle.get(a.id) ?? []).map(
      (b): EditorBlock => ({
        ...b,
        type: "block",
        components: (componentsByBlock.get(b.id) ?? []).map((c): EditorComponent => ({ ...c, type: "component" })),
      }),
    ),
  });

  const buildCo = (co: ContentObject): EditorContentObject => ({
    ...co,
    type: "contentobject",
    articles: (articlesByPage.get(co.id) ?? []).map(buildArticle),
    children: (cosByParent.get(co.id) ?? []).map(buildCo),
  });

  return { course, contentObjects: (cosByParent.get(ROOT) ?? []).map(buildCo) };
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const arr = map.get(k);
    if (arr) arr.push(item);
    else map.set(k, [item]);
  }
  return map;
}
