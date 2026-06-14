import { fail, ok } from "@/server/http";
import { getCourseTree } from "@/server/services/tree.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    return ok(await getCourseTree(id));
  } catch (error) {
    return fail(error);
  }
}
