// Ajv-backed validation for component `properties`. Imported by the server (and the editor's
// submit-time check) — NOT re-exported from the package index so the renderer never pulls Ajv in.
import Ajv, { type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { registry } from "./registry";

// draft-07 semantics; validateSchema:false so our draft-2020 `$schema` string and custom
// keywords (x-ui, isSetting) are ignored rather than rejected.
const ajv = new Ajv({
  strict: false,
  validateSchema: false,
  useDefaults: true,
  removeAdditional: "failing",
  allErrors: true,
});
addFormats(ajv);

const cache = new Map<string, ValidateFunction>();

export function compileValidator(key: string): ValidateFunction {
  const cached = cache.get(key);
  if (cached) return cached;
  const schema = registry.getSchema(key);
  if (!schema) throw new Error(`Unknown component type: ${key}`);
  const validate = ajv.compile(schema);
  cache.set(key, validate);
  return validate;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  /** Normalized data (defaults applied, failing-additional removed). Persist this. */
  data: Record<string, unknown>;
  errors: ValidationError[];
}

export function validateProperties(key: string, properties: unknown): ValidationResult {
  const validate = compileValidator(key);
  const data = structuredClone(properties ?? {}) as Record<string, unknown>;
  const valid = validate(data) as boolean;
  const errors: ValidationError[] = (validate.errors ?? []).map((e) => ({
    path: e.instancePath || "/",
    message: e.message ?? "is invalid",
  }));
  return { valid, data, errors };
}
