import { relations, sql } from 'drizzle-orm'
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
  admissionDate: text('admission_date')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  dischargedAt: text('discharged_at'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const treatmentRecord = sqliteTable('treatment_record', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  patientId: integer('patient_id')
    .references(() => patient.id, { onDelete: 'cascade' })
    .notNull(),
  doctorId: integer('doctor_id')
    .references(() => doctor.id, { onDelete: 'set null' })
    .notNull(),
  description: text('description').notNull(),
  notes: text('notes'),
  treatmentDate: text('treatment_date')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const user = sqliteTable('user', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').unique().notNull(),
  password: text('password').notNull(), // In production, use bcrypt hashed passwords
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'superadmin'] })
    .notNull()
    .default('admin'),
  createdAt: text('created_at')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

export const auditLog = sqliteTable('audit_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  action: text('action').notNull(), // 'admit', 'discharge', 'transfer', 'treatment', 'create_doctor', etc.
  entityType: text('entity_type').notNull(), // 'patient', 'doctor', 'ward', 'team', 'treatment'
  entityId: integer('entity_id').notNull(),
  userId: integer('user_id')
    .references(() => user.id, { onDelete: 'set null' })
    .notNull(),
  details: text('details'), // JSON string with additional context
  timestamp: text('timestamp')
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
})

// Relations
export const patientRelations = relations(patient, ({ one, many }) => ({
  ward: one(ward, {
    fields: [patient.wardId],
    references: [ward.id],
  }),
  team: one(team, {
    fields: [patient.teamId],
    references: [team.id],
  }),
  treatmentRecords: many(treatmentRecord),
}))

export const wardRelations = relations(ward, ({ many }) => ({
  patients: many(patient),
}))

export const teamRelations = relations(team, ({ many }) => ({
  patients: many(patient),
  doctors: many(doctor),
}))

export const doctorRelations = relations(doctor, ({ one, many }) => ({
  team: one(team, {
    fields: [doctor.teamId],
    references: [team.id],
  }),
  treatmentRecords: many(treatmentRecord),
}))

export const treatmentRecordRelations = relations(treatmentRecord, ({ one }) => ({
  patient: one(patient, {
    fields: [treatmentRecord.patientId],
    references: [patient.id],
  }),
  doctor: one(doctor, {
    fields: [treatmentRecord.doctorId],
    references: [doctor.id],
  }),
}))

export const userRelations = relations(user, ({ many }) => ({
  auditLogs: many(auditLog),
}))

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(user, {
    fields: [auditLog.userId],
    references: [user.id],
  }),
}))
