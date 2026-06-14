import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { SaveInput, SavedObject, StorageProvider } from "./types";

const ROOT = process.env.ASSETS_DIR || path.join(process.cwd(), "data", "assets");

export class LocalFsStorage implements StorageProvider {
  async save({ buffer, filename }: SaveInput): Promise<SavedObject> {
    const hash = createHash("sha1").update(buffer).digest("hex");
    const ext = path.extname(filename).toLowerCase();
    const key = `${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash}${ext}`;
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, buffer);
    return { key, url: `/api/assets/file/${key}` };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch {
      /* already gone — ignore */
    }
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  private resolve(key: string): string {
    const full = path.resolve(ROOT, key);
    // Guard against path traversal via crafted keys.
    if (!full.startsWith(path.resolve(ROOT) + path.sep)) {
      throw new Error("Invalid storage key");
    }
    return full;
  }
}
