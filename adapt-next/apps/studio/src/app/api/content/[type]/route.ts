import { assertNodeType, createNodeSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { createNode } from "@/server/services/contentNode.service";

type Ctx = { params: Promise<{ type: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { type } = await ctx.params;
    const nodeType = assertNodeType(type);
    const input = await parseJson(req, createNodeSchema);
    return ok(await createNode(nodeType, input), 201);
  } catch (error) {
    return fail(error);
  }
}
