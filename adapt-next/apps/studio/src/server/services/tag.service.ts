import { prisma } from "../db";
import { DEV_USER_ID, ensureDevUser } from "../auth";

export async function listTags(q?: string) {
  await ensureDevUser();
  return prisma.tag.findMany({
    where: { ownerId: DEV_USER_ID, ...(q ? { name: { contains: q, mode: "insensitive" } } : {}) },
    orderBy: { name: "asc" },
  });
}

/** Find-or-create tags by (ownerId, name); returns the resolved Tag rows. */
export async function ensureTags(names: string[]) {
  await ensureDevUser();
  const clean = [...new Set(names.map((n) => n.trim()).filter(Boolean))];
  const tags = [];
  for (const name of clean) {
    tags.push(
      await prisma.tag.upsert({
        where: { ownerId_name: { ownerId: DEV_USER_ID, name } },
        update: {},
        create: { ownerId: DEV_USER_ID, name },
      }),
    );
  }
  return tags;
}

export async function setCourseTags(courseId: string, names: string[]) {
  const tags = await ensureTags(names);
  await prisma.courseTag.deleteMany({ where: { courseId } });
  if (tags.length) {
    await prisma.courseTag.createMany({ data: tags.map((t) => ({ courseId, tagId: t.id })) });
  }
}

export async function setAssetTags(assetId: string, names: string[]) {
  const tags = await ensureTags(names);
  await prisma.assetTag.deleteMany({ where: { assetId } });
  if (tags.length) {
    await prisma.assetTag.createMany({ data: tags.map((t) => ({ assetId, tagId: t.id })) });
  }
}
