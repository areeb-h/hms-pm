import { createClient } from '@libsql/client'
import * as fs from 'fs'
import * as path from 'path'

async function applyMigration() {
  const client = createClient({
    url: process.env.DATABASE_URL || 'file:sqlite.db',
    ...(process.env.DATABASE_AUTH_TOKEN && { authToken: process.env.DATABASE_AUTH_TOKEN }),
  })

  const migrationFile = path.join(process.cwd(), 'drizzle', '0005_shallow_kinsey_walden.sql')
  const migrationSQL = fs.readFileSync(migrationFile, 'utf-8')

  const statements = migrationSQL
    .split('--> statement-breakpoint')
    .map(s => s.trim())
    .filter(s => s.length > 0)

  console.log(`Applying migration: 0005_shallow_kinsey_walden.sql`)
  console.log(`Found ${statements.length} statements to execute\n`)

  try {
    for (let i = 0; i < statements.length; i++) {
      console.log(`[${i + 1}/${statements.length}] Executing statement...`)
      await client.execute(statements[i])
    }
    console.log('\n✓ Migration applied successfully!')
  } catch (error) {
    console.error('\n✗ Migration failed:', error)
    throw error
  }
}

applyMigration()
  .then(() => {
    console.log('Done!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Error:', error)
    process.exit(1)
  })
