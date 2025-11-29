// ============================================================================
// lib/helpers/action.ts
// Universal Server Action Helper (Next.js 15+ | Zod v4)
// ============================================================================

"use server";

import { revalidatePath } from "next/cache";
import { z, ZodError } from "zod";
import { validateSchema, toErrorMap } from "./validation";
import { FieldError } from "./error";

export interface FormResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | null;
  errors?: Record<string, string[]>;
}

function normalizeInput(input: unknown): Record<string, any> | unknown {
  if (input instanceof FormData) return Object.fromEntries(input.entries());
  return input;
}

interface ActionConfig<TSchema extends z.ZodTypeAny, TResult> {
  schema?: TSchema;
  revalidate?: string | string[];
  successMessage?: string;
  execute: (data: z.infer<TSchema>) => Promise<TResult> | TResult;
}

/**
 * Hybrid action: works as both
 *  ✅ a form action (Next.js useActionState)
 *  ✅ a direct server call (await action(data))
 */
export async function createAction<TSchema extends z.ZodTypeAny, TResult>(
  config: ActionConfig<TSchema, TResult>,
) {
  // internal execution logic
  async function run(input: unknown): Promise<FormResponse<TResult>> {
    let data = normalizeInput(input);

    try {
      if (config.schema) {
        const validation = validateSchema(config.schema, data);
        if (!validation.success) {
          return {
            success: false,
            message: "Validation failed.",
            error: "Validation failed.",
            errors: validation.errorMap,
          };
        }
        data = validation.data;
      }

      const result = await config.execute(data as z.infer<TSchema>);
      const finalMessage =
        (result as any)?.message ??
        config.successMessage ??
        "Action completed successfully.";
      const finalData =
        (result as any)?.data !== undefined ? (result as any).data : result;

      if (config.revalidate) {
        const paths = Array.isArray(config.revalidate)
          ? config.revalidate
          : [config.revalidate];
        for (const path of paths) revalidatePath(path);
      }

      return { success: true, message: finalMessage, data: finalData };
    } catch (err) {
      if (err instanceof FieldError) {
        return {
          success: false,
          message: err.message,
          error: err.message,
          errors: err.fieldErrors,
        };
      }

      if (err instanceof ZodError) {
        return {
          success: false,
          message: "Validation failed.",
          error: "Validation failed.",
          errors: toErrorMap(err),
        };
      }

      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
            ? err
            : "Unknown server error.";

      console.error(`[Action:${config.execute.name || "anonymous"}]`, err);
      return { success: false, message, error: message };
    }
  }

  // dual-mode wrapper
  const hybridAction = async function (
    prevStateOrData: FormResponse<TResult> | z.infer<TSchema>,
    formData?: FormData,
  ): Promise<FormResponse<TResult>> {
    const isFormAction =
      typeof prevStateOrData === "object" &&
      prevStateOrData !== null &&
      "success" in prevStateOrData;

    const input = isFormAction ? formData : prevStateOrData;
    return run(input);
  };

  // explicitly expose a strict form-compatible signature
  hybridAction.asFormAction = async function (
    _prevState: FormResponse<TResult>,
    formData: FormData,
  ): Promise<FormResponse<TResult>> {
    return run(formData);
  };

  return hybridAction;
}
