import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { ApiError } from "../http";
import type { z } from "zod";
import type { updateConfigSchema, updateCourseSchema } from "../dto";
import { DEV_USER_ID, ensureDevUser } from "../auth";
import { setCourseTags } from "./tag.service";

const tagSelect = { tags: { select: { tag: { select: { id: true, name: true } } } } } as const;

function flattenTags<T extends { tags: { tag: { id: string; name: string } }[] }>(row: T) {
  return { ...row, tags: row.tags.map((ct) => ct.tag) };
}

export async function listCourses() {
  await ensureDevUser();
  const rows = await prisma.course.findMany({
    where: { ownerId: DEV_USER_ID },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, displayTitle: true, updatedAt: true, createdAt: true, ...tagSelect },
  });
  return rows.map(flattenTags);
}

export async function createCourse(input: { title: string }) {
  await ensureDevUser();
  return prisma.course.create({
    data: {
      title: input.title,
      displayTitle: input.title,
      ownerId: DEV_USER_ID,
      config: { create: {} },
      contentObjects: {
        create: { title: "Page 1", displayTitle: "Page 1", kind: "page", sortOrder: 1 },
      },
    },
    include: { config: true },
  });
}

export async function getCourse(id: string) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: { config: true, ...tagSelect },
  });
  if (!course) throw new ApiError(404, "Course not found");
  return flattenTags(course);
}

export async function updateCourse(id: string, patch: z.infer<typeof updateCourseSchema>) {
  const { tags, ...rest } = patch;
  try {
    await prisma.course.update({ where: { id }, data: rest });
  } catch {
    throw new ApiError(404, "Course not found");
  }
  if (tags) await setCourseTags(id, tags);
  return getCourse(id);
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
  } catch {
    throw new ApiError(404, "Course not found");
  }
}

export async function updateConfig(courseId: string, patch: z.infer<typeof updateConfigSchema>) {
  const { themeSettings, ...rest } = patch;
  const data: Prisma.CourseConfigUpdateInput = { ...rest };
  if (themeSettings !== undefined) data.themeSettings = themeSettings as Prisma.InputJsonValue;
  try {
    return await prisma.courseConfig.update({ where: { courseId }, data });
  } catch {
    throw new ApiError(404, "Course config not found");
  }
}
