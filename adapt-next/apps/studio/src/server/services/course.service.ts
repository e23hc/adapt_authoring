import { prisma } from "../db";
import { ApiError } from "../http";
import type { z } from "zod";
import type { updateConfigSchema, updateCourseSchema } from "../dto";

// Single-user stub for the MVP. Swap for platform SSO later (the only auth seam).
const DEV_USER = { id: "dev-user", email: "dev@adapt-next.local", name: "Dev User" };

export async function ensureDevUser() {
  return prisma.user.upsert({
    where: { id: DEV_USER.id },
    update: {},
    create: DEV_USER,
  });
}

export async function listCourses() {
  await ensureDevUser();
  return prisma.course.findMany({
    where: { ownerId: DEV_USER.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, displayTitle: true, updatedAt: true, createdAt: true },
  });
}

export async function createCourse(input: { title: string }) {
  await ensureDevUser();
  return prisma.course.create({
    data: {
      title: input.title,
      displayTitle: input.title,
      ownerId: DEV_USER.id,
      config: { create: {} },
      contentObjects: {
        create: { title: "Page 1", displayTitle: "Page 1", kind: "page", sortOrder: 1 },
      },
    },
    include: { config: true },
  });
}

export async function getCourse(id: string) {
  const course = await prisma.course.findUnique({ where: { id }, include: { config: true } });
  if (!course) throw new ApiError(404, "Course not found");
  return course;
}

export async function updateCourse(id: string, patch: z.infer<typeof updateCourseSchema>) {
  try {
    return await prisma.course.update({ where: { id }, data: patch });
  } catch {
    throw new ApiError(404, "Course not found");
  }
}

export async function deleteCourse(id: string) {
  try {
    await prisma.course.delete({ where: { id } });
  } catch {
    throw new ApiError(404, "Course not found");
  }
}

export async function updateConfig(courseId: string, patch: z.infer<typeof updateConfigSchema>) {
  try {
    return await prisma.courseConfig.update({ where: { courseId }, data: patch });
  } catch {
    throw new ApiError(404, "Course config not found");
  }
}
