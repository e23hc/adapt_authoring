import { updateAssetSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { deleteAsset, getAsset, updateAsset } from "@/server/services/asset.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    return ok(await getAsset(id));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const patch = await parseJson(req, updateAssetSchema);
    return ok(await updateAsset(id, patch));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await deleteAsset(id);
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}
