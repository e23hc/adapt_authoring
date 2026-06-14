import { createTagSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { ensureTags, listTags } from "@/server/services/tag.service";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    return ok(await listTags(searchParams.get("q") ?? undefined));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await parseJson(req, createTagSchema);
    const [tag] = await ensureTags([name]);
    return ok(tag, 201);
  } catch (error) {
    return fail(error);
  }
}
