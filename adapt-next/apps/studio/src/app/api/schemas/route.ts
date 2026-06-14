import { nodeSchemas, registry } from "@adapt-next/content-schemas";
import { fail, ok } from "@/server/http";

// Content-type schemas for the editor (mirrors the legacy /api/content/schema, but
// sourced from the filesystem registry). Long-cacheable on the client.
export async function GET() {
  try {
    const components = registry.list().map((meta) => ({
      ...meta,
      schema: registry.getSchema(meta.key),
      defaults: registry.getDefaults(meta.key),
    }));
    return ok({ components, nodeSchemas });
  } catch (error) {
    return fail(error);
  }
}
