import { fail } from "@/server/http";
import { readAssetFile } from "@/server/services/asset.service";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
};

function mimeFromKey(key: string): string {
  const dot = key.lastIndexOf(".");
  const ext = dot >= 0 ? key.slice(dot).toLowerCase() : "";
  return MIME[ext] ?? "application/octet-stream";
}

type Ctx = { params: Promise<{ key: string[] }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { key } = await ctx.params;
    const joined = key.join("/");
    const buffer = await readAssetFile(joined);
    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": mimeFromKey(joined),
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return fail(error);
  }
}
