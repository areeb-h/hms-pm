'use server'

import { db } from '@/db/drizzle'
import { patient, team, ward } from '@/db/schema'
import { patientSchema } from '@/lib/validators'
import { and, count, eq, isNull, ne, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

/**
 * COMMON COLUMN SHAPE
 * This guarantees NO TS mismatches in UI.
 */
const fullPatientFields = {
  id: patient.id,
  name: patient.name,
  dob: patient.dob,
  gender: sql<'male' | 'female'>`${patient.gender}`,
  wardId: patient.wardId,
  teamId: patient.teamId,
  wardName: ward.name,
  teamName: team.name,
  admissionDate: patient.createdAt,
  dischargedAt: patient.dischargedAt,
}

// ------------------ ADMIT PATIENT ---------------------

export async function admitPatient(formData: FormData) {
  try {
    const rawDob = formData.get('dob') as string | null
    const rawWardId = formData.get('wardId') as string | null
    const rawTeamId = formData.get('teamId') as string | null

    const dob = rawDob || undefined
    const wardId = rawWardId ? parseInt(rawWardId, 10) : undefined
    const teamId = rawTeamId ? parseInt(rawTeamId, 10) : undefined

    const data = {
      name: String(formData.get('name')),
      dob,
      gender: formData.get('gender') as 'male' | 'female',
      wardId,
      teamId,
    }

    // manual required fields
    if (!data.name?.trim()) throw new Error('Patient name is required')
    if (!data.gender) throw new Error('Gender is required')
    if (wardId == null) throw new Error('Ward selection is required')
    if (teamId == null) throw new Error('Team selection is required')

    const validated = patientSchema.safeParse(data)
    if (!validated.success) throw new Error(validated.error.message)

    // Ward existence
    const w = await db.select().from(ward).where(eq(ward.id, wardId))
    if (!w.length) throw new Error('Selected ward does not exist')

    // Check gender compatibility (mixed wards accept any gender)
    if (w[0].genderType !== 'mixed' && w[0].genderType !== validated.data.gender) {
      throw new Error(`This ward only accepts ${w[0].genderType} patients`)
    }

    // Ward capacity
    const patientCount = await db
      .select({ count: count() })
      .from(patient)
      .where(and(eq(patient.wardId, wardId), isNull(patient.dischargedAt)))

    if (patientCount[0].count >= w[0].capacity) {
      throw new Error(`Ward is at full capacity (${w[0].capacity})`)
    }

    // Team existence
    const t = await db.select().from(team).where(eq(team.id, teamId))
    if (!t.length) throw new Error('Selected team does not exist')

    await db.insert(patient).values(validated.data)
    revalidatePath('/patients')

    return { success: true, message: 'Patient admitted successfully' }
  } catch (error) {
    console.error('Error admitting patient:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to admit patient')
  }
}

// ------------------ TRANSFER PATIENT ---------------------

export async function transferPatient(formData: FormData) {
  try {
    const rawPatientId = formData.get('patientId') as string
    const rawNewWardId = formData.get('newWardId') as string

    const patientId = parseInt(rawPatientId || '', 10)
    const newWardId = parseInt(rawNewWardId || '', 10)

    if (isNaN(patientId) || isNaN(newWardId)) throw new Error('Invalid patient or ward ID')

    const p = await db.select().from(patient).where(eq(patient.id, patientId))
    if (!p.length) throw new Error('Patient not found')
    if (p[0].dischargedAt) throw new Error('Cannot transfer discharged patient')

    // ward validation
    const w = await db.select().from(ward).where(eq(ward.id, newWardId))
    if (!w.length) throw new Error('Selected ward does not exist')

    // Check gender compatibility (mixed wards accept any gender)
    if (w[0].genderType !== 'mixed' && w[0].genderType !== p[0].gender) {
      throw new Error(`This ward only accepts ${w[0].genderType} patients`)
    }

    // ward capacity excluding current patient
    const wc = await db
      .select({ count: count() })
      .from(patient)
      .where(
        and(eq(patient.wardId, newWardId), isNull(patient.dischargedAt), ne(patient.id, patientId))
      )

    if (wc[0].count >= w[0].capacity) throw new Error(`Ward is at full capacity (${w[0].capacity})`)

    await db.update(patient).set({ wardId: newWardId }).where(eq(patient.id, patientId))

    revalidatePath('/patients')
  } catch (error) {
    console.error('Error transferring patient:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to transfer patient')
  }
}

// ------------------ DISCHARGE ---------------------

export async function dischargePatient(formData: FormData) {
  try {
    const rawPatientId = formData.get('patientId') as string
    const patientId = parseInt(rawPatientId || '', 10)

    if (isNaN(patientId)) throw new Error('Invalid patient ID')

    const p = await db.select().from(patient).where(eq(patient.id, patientId))
    if (!p.length) throw new Error('Patient not found')
    if (p[0].dischargedAt) throw new Error('Already discharged')

    await db
      .update(patient)
      .set({ dischargedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(patient.id, patientId))

    revalidatePath('/patients')
  } catch (error) {
    console.error('Error discharging patient:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to discharge patient')
  }
}

// ------------------ HELPERS ---------------------

export async function getWards() {
  try {
    return await db
      .select({
        id: ward.id,
        name: ward.name,
        genderType: sql<'male' | 'female'>`${ward.genderType}`,
        capacity: ward.capacity,
        createdAt: ward.createdAt,
      })
      .from(ward)
  } catch (error) {
    console.error('Error fetching wards:', error)
    return []
  }
}

export async function getTeams() {
  try {
    return await db.select().from(team)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return []
  }
}

// ------------------ LIST ALL PATIENTS ---------------------

/**
 * ALWAYS return full shape.
 * UI never breaks.
 */
export async function getAllPatients() {
  try {
    return await db
      .select(fullPatientFields)
      .from(patient)
      .leftJoin(ward, eq(patient.wardId, ward.id))
      .leftJoin(team, eq(patient.teamId, team.id))
      .where(isNull(patient.dischargedAt))
  } catch (error) {
    console.error('Error fetching all patients:', error)
    return []
  }
}

// ------------------ PAGINATION / SEARCH ---------------------

export async function getPatients({
  page = 1,
  pageSize = 10,
  filter,
  ward: wardParam,
  team: teamParam,
  sortBy,
  sortOrder,
  startDate,
  endDate,
}: {
  page?: number
  pageSize?: number
  filter?: string | null
  ward?: string | null
  team?: string | null
  sortBy?: string | null
  sortOrder?: string | null
  startDate?: string | null
  endDate?: string | null
}) {
  try {
    const whereClauses = [isNull(patient.dischargedAt)]

    if (filter) {
      whereClauses.push(sql`${patient.name} LIKE ${`%${filter}%`}`)
    }

    if (wardParam) {
      const wid = parseInt(wardParam, 10)
      if (!isNaN(wid)) whereClauses.push(eq(patient.wardId, wid))
    }

    if (teamParam) {
      const tid = parseInt(teamParam, 10)
      if (!isNaN(tid)) whereClauses.push(eq(patient.teamId, tid))
    }

    if (startDate) whereClauses.push(sql`${patient.createdAt} >= ${startDate}`)
    if (endDate) whereClauses.push(sql`${patient.createdAt} <= ${endDate}`)

    const offset = Math.max(0, (page - 1) * pageSize)

    // count
    const totalRes = await db
      .select({ count: count() })
      .from(patient)
      .where(and(...whereClauses))
    const totalCount = Number(totalRes[0]?.count ?? 0)

    // sorting
    const sortDir = sortOrder === 'asc' ? sql`asc` : sql`desc`
    const sortMap: Record<string, ReturnType<typeof sql>> = {
      name: sql`${patient.name} ${sortDir}`,
      admissionDate: sql`${patient.createdAt} ${sortDir}`,
    }

    const orderClause = sortMap[sortBy ?? 'admissionDate'] ?? sql`${patient.createdAt} desc`

    const data = await db
      .select(fullPatientFields)
      .from(patient)
      .leftJoin(ward, eq(patient.wardId, ward.id))
      .leftJoin(team, eq(patient.teamId, team.id))
      .where(and(...whereClauses))
      .limit(pageSize)
      .offset(offset)
      .orderBy(orderClause)

    return { data, totalCount }
  } catch (error) {
    console.error('Error fetching paginated patients:', error)
    return { data: [], totalCount: 0 }
  }
}

export async function getPatientsByWard(wardId: number) {
  return db.query.patient.findMany({
    where: eq(patient.wardId, wardId),
    with: {
      team: true,
      ward: true,
    },
  })
}

export async function getPatientsByTeam(teamId: number) {
  return db.query.patient.findMany({
    where: eq(patient.teamId, teamId),
    with: {
      team: true,
      ward: true,
    },
  })
}

export async function getPatientTreatmentsAction(patientId: number) {
  'use server'
  const { doctor, treatmentRecord } = await import('@/db/schema')
  const { desc } = await import('drizzle-orm')

  const treatments = await db
    .select({
      id: treatmentRecord.id,
      doctorName: doctor.name,
      doctorGrade: doctor.grade,
      teamName: team.name,
      description: treatmentRecord.description,
      notes: treatmentRecord.notes,
      treatmentDate: treatmentRecord.treatmentDate,
      createdAt: treatmentRecord.createdAt,
    })
    .from(treatmentRecord)
    .innerJoin(doctor, eq(treatmentRecord.doctorId, doctor.id))
    .leftJoin(team, eq(doctor.teamId, team.id))
    .where(eq(treatmentRecord.patientId, patientId))
    .orderBy(desc(treatmentRecord.treatmentDate))

  return treatments
}

export async function getDoctorsForTreatment() {
  'use server'
  const { doctor } = await import('@/db/schema')

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

export async function recordTreatmentFromPatient(formData: FormData) {
  'use server'
  const { recordTreatment } = await import('@/app/(app)/treatment/actions')
  return await recordTreatment(formData)
}
