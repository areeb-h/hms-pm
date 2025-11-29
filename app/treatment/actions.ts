'use server'
import { db } from '@/db/drizzle'
import { doctor, patient, team, teamConsultant, treatmentRecord } from '@/db/schema'
import { treatmentRecordSchema } from '@/lib/validators'
import { eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function recordTreatment(formData: FormData) {
  const data = {
    patientId: parseInt(formData.get('patientId') as string),
    doctorId: parseInt(formData.get('doctorId') as string),
  }

  const validated = treatmentRecordSchema.safeParse(data)
  if (!validated.success) {
    throw new Error(validated.error.message)
  }

  // Check patient exists and not discharged
  const p = await db
    .select({ teamId: patient.teamId, dischargedAt: patient.dischargedAt })
    .from(patient)
    .where(eq(patient.id, validated.data.patientId))
  if (!p.length) {
    throw new Error('Patient not found')
  }
  if (p[0].dischargedAt) {
    throw new Error('Cannot record treatment for discharged patient')
  }

  // Check doctor and patient in same team
  const d = await db
    .select({ teamId: doctor.teamId })
    .from(doctor)
    .where(eq(doctor.id, validated.data.doctorId))
  if (!d.length || p[0].teamId !== d[0].teamId) {
    throw new Error('Doctor and patient not in same team')
  }

  await db.insert(treatmentRecord).values(validated.data)
  revalidatePath('/treatment')
}

export async function getPatientSummary(patientId: number) {
  // Get patient team
  const p = await db
    .select({ teamId: patient.teamId, dischargedAt: patient.dischargedAt })
    .from(patient)
    .where(eq(patient.id, patientId))
  if (!p.length) throw new Error('Patient not found')
  if (p[0].dischargedAt) throw new Error('Patient is discharged')
  if (!p[0].teamId) throw new Error('Patient not assigned to a team')

  const teamId = p[0].teamId

  // Get team code
  const t = await db.select({ code: team.code }).from(team).where(eq(team.id, teamId))

  // Get consultant
  const consultant = await db
    .select({ name: doctor.name })
    .from(teamConsultant)
    .innerJoin(doctor, eq(teamConsultant.doctorId, doctor.id))
    .where(eq(teamConsultant.teamId, teamId))

  // Get treating doctors
  const treatments = await db
    .select({ name: doctor.name, grade: doctor.grade })
    .from(treatmentRecord)
    .innerJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
    .where(eq(treatmentRecord.patientId, patientId))

  return {
    consultantName: consultant[0]?.name,
    teamCode: t[0]?.code,
    doctors: treatments,
  }
}

export async function getPatients() {
  return await db
    .select({ id: patient.id, name: patient.name })
    .from(patient)
    .where(isNull(patient.dischargedAt))
}

export async function getDoctors() {
  return await db.select({ id: doctor.id, name: doctor.name }).from(doctor)
}
