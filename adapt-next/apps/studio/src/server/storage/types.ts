export interface SaveInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface SavedObject {
  /** Provider-relative key used to delete/read later. */
  key: string;
  /** URL the app/renderer uses to fetch the object. */
  url: string;
}

/**
 * Pluggable storage backend. The local implementation ships now; S3 / Google Drive / etc.
 * implement this same interface and are selected via the STORAGE_DRIVER env var (see ./index.ts).
 */
export interface StorageProvider {
  save(input: SaveInput): Promise<SavedObject>;
  delete(key: string): Promise<void>;
  /** Local-only: read bytes for the file-serving route. Cloud providers serve via their own URL. */
  read?(key: string): Promise<Buffer>;
}
