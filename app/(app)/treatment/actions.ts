'use server'
import { db } from '@/db/drizzle'
import { doctor, patient, team, teamConsultant, treatmentRecord, ward } from '@/db/schema'
import { desc, eq, isNull } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function recordTreatment(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  try {
    const patientId = parseInt(formData.get('patientId') as string)
    const doctorId = parseInt(formData.get('doctorId') as string)
    const description = (formData.get('description') as string) || ''
    const notes = (formData.get('treatmentNotes') as string) || null

    if (!patientId || !doctorId) {
      return { success: false, message: 'Patient and doctor are required' }
    }

    if (!description.trim()) {
      return { success: false, message: 'Treatment description is required' }
    }

    // Check patient exists and not discharged
    const p = await db
      .select({ teamId: patient.teamId, dischargedAt: patient.dischargedAt, name: patient.name })
      .from(patient)
      .where(eq(patient.id, patientId))
    if (!p.length) {
      return { success: false, message: 'Patient not found' }
    }
    if (p[0].dischargedAt) {
      return { success: false, message: 'Cannot record treatment for discharged patient' }
    }

    // Check doctor and patient in same team
    const d = await db
      .select({ teamId: doctor.teamId, name: doctor.name })
      .from(doctor)
      .where(eq(doctor.id, doctorId))
    if (!d.length || p[0].teamId !== d[0].teamId) {
      return { success: false, message: 'Doctor and patient must be in the same team' }
    }

    // Insert treatment record
    await db.insert(treatmentRecord).values({
      patientId,
      doctorId,
      description,
      notes,
    })

    // Log audit (TODO: get actual user ID from session)
    const { auditLog } = await import('@/db/schema')
    await db.insert(auditLog).values({
      action: 'record_treatment',
      entityType: 'treatment',
      entityId: patientId,
      userId: 1, // TODO: Replace with actual logged-in user ID
      details: JSON.stringify({
        patientId,
        patientName: p[0].name,
        doctorId,
        doctorName: d[0].name,
        description,
        notes,
      }),
    })

    revalidatePath('/treatment')
    revalidatePath('/patients')

    return { success: true, message: 'Treatment recorded successfully' }
  } catch (error) {
    console.error('Record treatment error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to record treatment',
    }
  }
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
  const patients = await db
    .select({
      id: patient.id,
      name: patient.name,
      wardId: patient.wardId,
      teamId: patient.teamId,
      wardName: ward.name,
      teamName: team.name,
    })
    .from(patient)
    .leftJoin(ward, eq(patient.wardId, ward.id))
    .leftJoin(team, eq(patient.teamId, team.id))
    .where(isNull(patient.dischargedAt))

  return patients
}

export async function getDoctors() {
  const doctors = await db
    .select({
      id: doctor.id,
      name: doctor.name,
      grade: doctor.grade,
      teamId: doctor.teamId,
      teamName: team.name,
    })
    .from(doctor)
    .leftJoin(team, eq(doctor.teamId, team.id))

  return doctors
}

export async function getTreatments() {
  const treatments = await db
    .select({
      id: treatmentRecord.id,
      patientId: treatmentRecord.patientId,
      patientName: patient.name,
      doctorId: treatmentRecord.doctorId,
      doctorName: doctor.name,
      doctorGrade: doctor.grade,
      teamName: team.name,
      wardName: ward.name,
      createdAt: treatmentRecord.createdAt,
    })
    .from(treatmentRecord)
    .innerJoin(patient, eq(treatmentRecord.patientId, patient.id))
    .innerJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
    .leftJoin(team, eq(patient.teamId, team.id))
    .leftJoin(ward, eq(patient.wardId, ward.id))
    .where(isNull(patient.dischargedAt))
    .orderBy(desc(treatmentRecord.createdAt))

  return treatments
}

export async function getTreatmentsPaginated(params: {
  page: number
  pageSize: number
  filter?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) {
  const { page, pageSize, sortBy = 'treatmentDate', sortOrder = 'desc' } = params
  const offset = (page - 1) * pageSize

  const orderClause =
    sortOrder === 'asc' ? treatmentRecord.treatmentDate : desc(treatmentRecord.treatmentDate)

  const [data, totalResult] = await Promise.all([
    db
      .select({
        id: treatmentRecord.id,
        patientName: patient.name,
        doctorName: doctor.name,
        doctorGrade: doctor.grade,
        teamName: team.name,
        wardName: ward.name,
        description: treatmentRecord.description,
        notes: treatmentRecord.notes,
        treatmentDate: treatmentRecord.treatmentDate,
        createdAt: treatmentRecord.createdAt,
      })
      .from(treatmentRecord)
      .innerJoin(patient, eq(treatmentRecord.patientId, patient.id))
      .innerJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
      .leftJoin(team, eq(patient.teamId, team.id))
      .leftJoin(ward, eq(patient.wardId, ward.id))
      .orderBy(orderClause)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: treatmentRecord.id }).from(treatmentRecord),
  ])

  return {
    data,
    total: totalResult.length,
  }
}

export async function getPatientTreatments(patientId: number) {
  const treatments = await db
    .select({
      id: treatmentRecord.id,
      doctorName: doctor.name,
      doctorGrade: doctor.grade,
      teamName: team.name,
      createdAt: treatmentRecord.createdAt,
    })
    .from(treatmentRecord)
    .innerJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
    .leftJoin(team, eq(doctor.teamId, team.id))
    .where(eq(treatmentRecord.patientId, patientId))
    .orderBy(desc(treatmentRecord.createdAt))

  return treatments
}
