import { NextResponse } from "next/server";
import type { z, ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message, details: error.details }, { status: error.status });
  }
  console.error("[api] unhandled error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function parseJson<S extends ZodType>(req: Request, schema: S): Promise<z.output<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError(400, "Invalid request body", result.error.flatten());
  }
  return result.data;
}
