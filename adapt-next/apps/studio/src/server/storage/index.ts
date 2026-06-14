import { LocalFsStorage } from "./local";
import type { StorageProvider } from "./types";

let instance: StorageProvider | null = null;

/**
 * Returns the configured storage provider (singleton).
 * To add S3 / Google Drive: implement `StorageProvider` (see ./types.ts) and add a case here,
 * then set STORAGE_DRIVER=s3 (etc.) in the environment. No callers change.
 */
export function getStorage(): StorageProvider {
  if (instance) return instance;
  const driver = process.env.STORAGE_DRIVER ?? "local";
  switch (driver) {
    case "local":
      instance = new LocalFsStorage();
      break;
    // case "s3":     instance = new S3Storage();     break;  // TODO
    // case "gdrive": instance = new GDriveStorage(); break;  // TODO
    default:
      throw new Error(`Unknown STORAGE_DRIVER "${driver}". Implement a StorageProvider in src/server/storage/.`);
  }
  return instance;
}

export type { StorageProvider } from "./types";
