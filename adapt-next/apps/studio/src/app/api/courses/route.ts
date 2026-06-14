import { createCourseSchema } from "@/server/dto";
import { fail, ok, parseJson } from "@/server/http";
import { createCourse, listCourses } from "@/server/services/course.service";

export async function GET() {
  try {
    return ok(await listCourses());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: Request) {
  try {
    const input = await parseJson(req, createCourseSchema);
    return ok(await createCourse(input), 201);
  } catch (error) {
    return fail(error);
  }
}
