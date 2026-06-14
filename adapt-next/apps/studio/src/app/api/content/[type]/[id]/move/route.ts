import { assertNodeType, moveSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { moveNode } from "@/server/services/contentNode.service";

type Ctx = { params: Promise<{ type: string; id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { type, id } = await ctx.params;
    const nodeType = assertNodeType(type);
    const { newParentId, sortOrder } = await parseJson(req, moveSchema);
    return ok(await moveNode(nodeType, id, newParentId, sortOrder));
  } catch (error) {
    return fail(error);
  }
}
