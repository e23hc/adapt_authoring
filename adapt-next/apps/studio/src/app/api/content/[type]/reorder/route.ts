import { assertNodeType, reorderSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { reorderNodes } from "@/server/services/contentNode.service";

type Ctx = { params: Promise<{ type: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { type } = await ctx.params;
    const nodeType = assertNodeType(type);
    const { orderedIds } = await parseJson(req, reorderSchema);
    await reorderNodes(nodeType, orderedIds);
    return ok({ orderedIds });
  } catch (error) {
    return fail(error);
  }
}
