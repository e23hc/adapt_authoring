import { updateConfigSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { updateConfig } from "@/server/services/course.service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const patch = await parseJson(req, updateConfigSchema);
    return ok(await updateConfig(id, patch));
  } catch (error) {
    return fail(error);
  }
}
