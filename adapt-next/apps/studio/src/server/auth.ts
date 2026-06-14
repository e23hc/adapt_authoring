import { prisma } from "./db";

// Single-user stub for the MVP. This is the one seam to replace with platform SSO:
// swap `currentUserId()` for the authenticated user and drop `ensureDevUser`.
export const DEV_USER = { id: "dev-user", email: "dev@adapt-next.local", name: "Dev User" };
export const DEV_USER_ID = DEV_USER.id;

export function currentUserId(): string {
  return DEV_USER_ID;
}

export async function ensureDevUser() {
  return prisma.user.upsert({ where: { id: DEV_USER.id }, update: {}, create: DEV_USER });
}
