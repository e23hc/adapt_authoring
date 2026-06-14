import { ApiError, fail, ok } from "@/server/http";
import { createAsset, listAssets } from "@/server/services/asset.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assets = await listAssets({
      type: searchParams.get("type") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });
    return ok(assets);
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new ApiError(400, "Missing 'file' in form data");
    const buffer = Buffer.from(await file.arrayBuffer());
    const title = typeof form.get("title") === "string" ? (form.get("title") as string) : undefined;
    const asset = await createAsset({
      buffer,
      filename: file.name || "upload",
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      title,
    });
    return ok(asset, 201);
  } catch (error) {
    return fail(error);
  }
}
