import { createClient } from '@libsql/client/sqlite3'
import { drizzle } from 'drizzle-orm/libsql'
import 'server-only'
import * as schema from './schema'

const client = createClient({ url: 'file:sqlite.db' })

export const db = drizzle(client, { schema })
