import sharp from "sharp";
import { prisma } from "../db";
import { ApiError } from "../http";
import { DEV_USER_ID, ensureDevUser } from "../auth";
import { getStorage } from "../storage";
import { setAssetTags } from "./tag.service";

const withTags = { tags: { include: { tag: true } } } as const;

function assetTypeFromMime(mime: string): string {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  size: number;
  title?: string;
}

export async function createAsset(input: UploadInput) {
  await ensureDevUser();
  const storage = getStorage();
  const saved = await storage.save({ buffer: input.buffer, filename: input.filename, mimeType: input.mimeType });
  const assetType = assetTypeFromMime(input.mimeType);

  let width: number | undefined;
  let height: number | undefined;
  let thumbnailKey: string | undefined;
  let thumbnailUrl: string | undefined;

  if (assetType === "image") {
    try {
      const img = sharp(input.buffer);
      const meta = await img.metadata();
      width = meta.width;
      height = meta.height;
      const thumb = await img
        .resize(320, 320, { fit: "inside", withoutEnlargement: true })
        .jpeg({ quality: 72 })
        .toBuffer();
      const t = await storage.save({ buffer: thumb, filename: `${input.filename}.thumb.jpg`, mimeType: "image/jpeg" });
      thumbnailKey = t.key;
      thumbnailUrl = t.url;
    } catch {
      /* thumbnail/metadata is best-effort */
    }
  }

  return prisma.asset.create({
    data: {
      ownerId: DEV_USER_ID,
      title: input.title?.trim() || input.filename,
      filename: input.filename,
      storageKey: saved.key,
      url: saved.url,
      mimeType: input.mimeType,
      assetType,
      size: input.size,
      width,
      height,
      thumbnailKey,
      thumbnailUrl,
    },
    include: withTags,
  });
}

export async function listAssets(opts: { type?: string; tag?: string; q?: string } = {}) {
  await ensureDevUser();
  return prisma.asset.findMany({
    where: {
      ownerId: DEV_USER_ID,
      ...(opts.type ? { assetType: opts.type } : {}),
      ...(opts.q ? { title: { contains: opts.q, mode: "insensitive" } } : {}),
      ...(opts.tag ? { tags: { some: { tag: { name: opts.tag } } } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: withTags,
  });
}

export async function getAsset(id: string) {
  const asset = await prisma.asset.findUnique({ where: { id }, include: withTags });
  if (!asset) throw new ApiError(404, "Asset not found");
  return asset;
}

export async function updateAsset(id: string, patch: { title?: string; tags?: string[] }) {
  await getAsset(id);
  if (patch.title !== undefined) {
    await prisma.asset.update({ where: { id }, data: { title: patch.title } });
  }
  if (patch.tags) {
    await setAssetTags(id, patch.tags);
  }
  return getAsset(id);
}

export async function deleteAsset(id: string) {
  const asset = await getAsset(id);
  const storage = getStorage();
  await storage.delete(asset.storageKey);
  if (asset.thumbnailKey) await storage.delete(asset.thumbnailKey);
  await prisma.asset.delete({ where: { id } });
}

export async function readAssetFile(key: string): Promise<Buffer> {
  const storage = getStorage();
  if (!storage.read) throw new ApiError(404, "File serving not supported by this storage driver");
  try {
    return await storage.read(key);
  } catch {
    throw new ApiError(404, "File not found");
  }
}
