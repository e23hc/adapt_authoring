import { updateCourseSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { deleteCourse, getCourse, updateCourse } from "@/server/services/course.service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    return ok(await getCourse(id));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const patch = await parseJson(req, updateCourseSchema);
    return ok(await updateCourse(id, patch));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    await deleteCourse(id);
    return ok({ id });
  } catch (error) {
    return fail(error);
  }
}
