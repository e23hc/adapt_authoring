import { validateProperties } from "@adapt-next/content-schemas/validate";
import { ApiError } from "../http";

/** Validate + normalize a component's `properties` against its JSON Schema, or throw 400. */
export function validateComponentProperties(componentKey: string, properties: unknown): Record<string, unknown> {
  const result = validateProperties(componentKey, properties);
  if (!result.valid) {
    throw new ApiError(400, `Invalid properties for component "${componentKey}"`, result.errors);
  }
  return result.data;
}
