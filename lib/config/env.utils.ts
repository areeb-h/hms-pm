import { z } from "zod";

// ---------------------------------------------------------------------------
// 🧩 URL schema (auto-strips trailing slashes)
// ---------------------------------------------------------------------------
export const urlSchema = z.url().transform((url) => url.replace(/\/+$/, ""));

// ---------------------------------------------------------------------------
// 🚀 Environment loader
// ---------------------------------------------------------------------------
export function parseEnv<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
): Readonly<z.infer<z.ZodObject<T>>> {
  const parsed = schema.parse(process.env);

  // Auto-disable TLS verification in development if not explicitly set
  if (
    "NODE_ENV" in parsed &&
    parsed.NODE_ENV === "development" &&
    "NODE_TLS_REJECT_UNAUTHORIZED" in parsed &&
    parsed.NODE_TLS_REJECT_UNAUTHORIZED === undefined
  ) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    (parsed as Record<string, unknown>).NODE_TLS_REJECT_UNAUTHORIZED = false;
    console.warn("⚠️  TLS verification disabled for development");
  }

    // Auto-fill defaults for local Oathkeeper setup
  if ("NODE_ENV" in parsed) {
    const port = process.env.PORT ?? "3000";
    const subdomain = process.env.NEXT_PUBLIC_APP_HOST ?? "local.docdev.bml.com.mv";

    if (!("AUTH_APP_URL" in parsed)) {
      (parsed as Record<string, unknown>).AUTH_APP_URL = `http://${subdomain}:${port}`;
    }

    if (!("ONEUI_CORE_API" in parsed)) {
      (parsed as Record<string, unknown>).ONEUI_CORE_API =
        "http://local.docdev.bml.com.mv:4455/api";
    }
  }

  return Object.freeze(parsed);
}