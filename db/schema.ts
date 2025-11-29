import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const ward = sqliteTable('ward', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  genderType: text('gender_type').notNull(), // male/female
  capacity: integer('capacity').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const team = sqliteTable('team', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').unique().notNull(),
  name: text('name').notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const doctor = sqliteTable('doctor', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  grade: text('grade').notNull(), // consultant | junior1 | junior2
  teamId: integer('team_id').references(() => team.id, { onDelete: 'cascade' }),
})

export const teamConsultant = sqliteTable('team_consultant', {
  teamId: integer('team_id')
    .references(() => team.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: integer('doctor_id')
    .references(() => doctor.id, { onDelete: 'cascade' })
    .notNull(),
})

export const patient = sqliteTable('patient', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  dob: text('dob'),
  gender: text('gender').notNull(),
  wardId: integer('ward_id').references(() => ward.id, { onDelete: 'set null' }),
  teamId: integer('team_id').references(() => team.id, { onDelete: 'set null' }),
  dischargedAt: text('discharged_at'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const treatmentRecord = sqliteTable('treatment_record', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id').references(() => patient.id, { onDelete: 'cascade' }),
  doctorId: integer('doctor_id').references(() => doctor.id, { onDelete: 'set null' }),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})
