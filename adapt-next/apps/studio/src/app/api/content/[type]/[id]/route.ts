import { assertNodeType, updateNodeSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { deleteNode, updateNode } from "@/server/services/contentNode.service";

type Ctx = { params: Promise<{ type: string; id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { type, id } = await ctx.params;
    const nodeType = assertNodeType(type);
    const patch = await parseJson(req, updateNodeSchema);
    return ok(await updateNode(nodeType, id, patch));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { type, id } = await ctx.params;
    const nodeType = assertNodeType(type);
    await deleteNode(nodeType, id);
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}
