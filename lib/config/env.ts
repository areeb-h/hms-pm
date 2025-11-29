import { z } from 'zod'
import { parseEnv, urlSchema } from './env.utils'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional URLs (with fallbacks in code)
  AUTH_APP_URL: urlSchema.optional(),
  ONEUI_CORE_API: urlSchema.optional(),
  ONEUI_HELPDESK_API: urlSchema.optional(),

  // Optional URLs
  GO_API_URL: urlSchema.optional(),
  // STORAGE_API_URL: urlSchema.optional(),
  // Booleans
  NODE_TLS_REJECT_UNAUTHORIZED: z.coerce.boolean().optional(),
})

export type Env = z.infer<typeof envSchema>

export const env = parseEnv(envSchema)
