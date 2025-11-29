import { z, ZodError, ZodObject, ZodRawShape } from "zod";

/** Infer the input/output type from any Zod schema */
export type InferSchema<T extends z.ZodTypeAny> = z.infer<T>;

/* -------------------------------------------------------------------------- */
/* 🧩 Error Conversion Helpers                                                */
/* -------------------------------------------------------------------------- */

/** Returns an array of flattened error messages */
export function toErrorList(err: ZodError): string[] {
  return err.issues.map((i) => {
    const path = i.path.join(".");
    return path ? `${path}: ${i.message}` : i.message;
  });
}

/** Returns a record of field-level errors for UI binding */
export function toErrorMap(err: ZodError): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_form";
    (map[key] ??= []).push(issue.message);
  }
  return map;
}

/* -------------------------------------------------------------------------- */
/* ⚙️ Schema Validation Wrapper                                              */
/* -------------------------------------------------------------------------- */

/**
 * Validates arbitrary input data against a Zod schema.
 * Returns unified error format (list + map) for both UX and logging.
 */
export function validateSchema<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: string[]; errorMap: Record<string, string[]> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    errors: toErrorList(result.error),
    errorMap: toErrorMap(result.error),
  };
}

/* -------------------------------------------------------------------------- */
/* 🧬 Schema Composition Helper                                              */
/* -------------------------------------------------------------------------- */

/**
 * Merges two Zod object schemas into one unified schema.
 * Useful for modular schema composition (e.g. core + extensions).
 */
export function mergeSchemas<A extends ZodRawShape, B extends ZodRawShape>(
  a: ZodObject<A>,
  b: ZodObject<B>,
): ZodObject<A & B> {
  return z.object({
    ...(a.shape as any),
    ...(b.shape as any),
  }) as unknown as ZodObject<A & B>;
}

/* -------------------------------------------------------------------------- */
/* 📦 Exports                                                                */
/* -------------------------------------------------------------------------- */

export { z };
