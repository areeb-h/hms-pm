import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import 'server-only'
import * as schema from './schema'

const client = createClient({
    url: process.env.DATABASE_URL || 'file:sqlite.db',
    ...(process.env.DATABASE_AUTH_TOKEN && { authToken: process.env.DATABASE_AUTH_TOKEN }),
})

export const db = drizzle(client, { schema })
