'use server'

import { db } from '@/db/drizzle'
import { patient, team, ward } from '@/db/schema'
import { patientSchema } from '@/lib/validators'
import { and, count, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function admitPatient(formData: FormData) {
  try {
    // Extract and validate form data with better error handling
    const rawDob = formData.get('dob') as string
    const rawWardId = formData.get('wardId') as string
    const rawTeamId = formData.get('teamId') as string

    // Parse with validation
    const dob = rawDob || undefined
    const wardId = rawWardId ? parseInt(rawWardId, 10) : undefined
    const teamId = rawTeamId ? parseInt(rawTeamId, 10) : undefined

    // Check for NaN values
    if (rawWardId && isNaN(wardId!)) {
      throw new Error('Invalid ward ID')
    }
    if (rawTeamId && isNaN(teamId!)) {
      throw new Error('Invalid team ID')
    }

    const data = {
      name: formData.get('name') as string,
      dob,
      gender: formData.get('gender') as 'male' | 'female',
      wardId,
      teamId,
    }

    // Validate required fields manually first
    if (!data.name?.trim()) {
      throw new Error('Patient name is required')
    }
    if (!data.gender) {
      throw new Error('Gender is required')
    }
    if (!data.wardId) {
      throw new Error('Ward selection is required')
    }
    if (!data.teamId) {
      throw new Error('Team selection is required')
    }

    const validated = patientSchema.safeParse(data)
    if (!validated.success) {
      throw new Error(validated.error.message)
    }

    // Check ward exists and gender match
    const w = await db.select().from(ward).where(eq(ward.id, validated.data.wardId))
    if (!w.length) {
      throw new Error('Selected ward does not exist')
    }
    if (w[0].genderType !== validated.data.gender) {
      throw new Error(`This ward only accepts ${w[0].genderType} patients`)
    }

    // Check capacity
    const patientCount = await db
      .select({ count: count() })
      .from(patient)
      .where(eq(patient.wardId, validated.data.wardId))
    if (patientCount[0].count >= w[0].capacity) {
      throw new Error(`Ward is at full capacity (${w[0].capacity} patients)`)
    }

    // Check team exists
    const t = await db.select().from(team).where(eq(team.id, validated.data.teamId))
    if (!t.length) {
      throw new Error('Selected team does not exist')
    }

    await db.insert(patient).values(validated.data)
    revalidatePath('/patients')

    return { success: true, message: 'Patient admitted successfully' }
  } catch (error) {
    console.error('Error admitting patient:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to admit patient')
  }
}

export async function getPatientsByWard(wardId: number) {
  try {
    return await db
      .select({
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        admissionDate: patient.createdAt,
      })
      .from(patient)
      .where(and(eq(patient.wardId, wardId), isNull(patient.dischargedAt)))
  } catch (error) {
    console.error('Error fetching patients by ward:', error)
    return []
  }
}

export async function getPatientsByTeam(teamId: number) {
  try {
    return await db
      .select({
        id: patient.id,
        name: patient.name,
        wardName: ward.name,
        teamRole: sql`'Primary Care'`, // Default role
      })
      .from(patient)
      .innerJoin(ward, eq(patient.wardId, ward.id))
      .where(and(eq(patient.teamId, teamId), isNull(patient.dischargedAt)))
  } catch (error) {
    console.error('Error fetching patients by team:', error)
    return []
  }
}

export async function transferPatient(formData: FormData) {
  try {
    const rawPatientId = formData.get('patientId') as string
    const rawNewWardId = formData.get('newWardId') as string

    if (!rawPatientId || !rawNewWardId) {
      throw new Error('Patient ID and new ward are required')
    }

    const patientId = parseInt(rawPatientId, 10)
    const newWardId = parseInt(rawNewWardId, 10)

    if (isNaN(patientId)) {
      throw new Error('Invalid patient ID')
    }
    if (isNaN(newWardId)) {
      throw new Error('Invalid ward ID')
    }

    // Get patient
    const p = await db.select().from(patient).where(eq(patient.id, patientId))
    if (!p.length) {
      throw new Error('Patient not found')
    }
    if (p[0].dischargedAt) {
      throw new Error('Cannot transfer a discharged patient')
    }

    // Check new ward
    const w = await db.select().from(ward).where(eq(ward.id, newWardId))
    if (!w.length) {
      throw new Error('Selected ward does not exist')
    }
    if (w[0].genderType !== p[0].gender) {
      throw new Error(`This ward only accepts ${w[0].genderType} patients`)
    }

    // Check capacity
    const patientCount = await db
      .select({ count: count() })
      .from(patient)
      .where(eq(patient.wardId, newWardId))
    if (patientCount[0].count >= w[0].capacity) {
      throw new Error(`Ward is at full capacity (${w[0].capacity} patients)`)
    }

    await db.update(patient).set({ wardId: newWardId }).where(eq(patient.id, patientId))
    revalidatePath('/patients')
  } catch (error) {
    console.error('Error transferring patient:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to transfer patient')
  }
}

export async function dischargePatient(formData: FormData) {
  try {
    const rawPatientId = formData.get('patientId') as string

    if (!rawPatientId) {
      throw new Error('Patient ID is required')
    }

    const patientId = parseInt(rawPatientId, 10)

    if (isNaN(patientId)) {
      throw new Error('Invalid patient ID')
    }

    // Check if patient exists
    const p = await db.select().from(patient).where(eq(patient.id, patientId))
    if (!p.length) {
      throw new Error('Patient not found')
    }
    if (p[0].dischargedAt) {
      throw new Error('Patient is already discharged')
    }

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

export async function getWards() {
  try {
    return await db.select().from(ward)
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

export async function getAllPatients() {
  try {
    return await db
      .select({
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        wardName: ward.name,
        teamName: team.name,
      })
      .from(patient)
      .leftJoin(ward, eq(patient.wardId, ward.id))
      .leftJoin(team, eq(patient.teamId, team.id))
      .where(isNull(patient.dischargedAt))
  } catch (error) {
    console.error('Error fetching all patients:', error)
    return []
  }
}

// Server-side paginated & filtered patients query used by the ServerTable
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
    const whereClauses: any[] = [isNull(patient.dischargedAt)]

    if (filter) {
      const like = `%${filter}%`
      whereClauses.push(sql`${patient.name} LIKE ${like}`)
    }

    if (wardParam) {
      const wid = parseInt(wardParam, 10)
      if (!isNaN(wid)) whereClauses.push(eq(patient.wardId, wid))
    }

    if (teamParam) {
      const tid = parseInt(teamParam, 10)
      if (!isNaN(tid)) whereClauses.push(eq(patient.teamId, tid))
    }

    if (startDate) {
      whereClauses.push(sql`${patient.createdAt} >= ${startDate}`)
    }

    if (endDate) {
      whereClauses.push(sql`${patient.createdAt} <= ${endDate}`)
    }

    const offset = Math.max(0, (page - 1) * pageSize)

    // total count
    const totalRes = await db
      .select({ count: count() })
      .from(patient)
      .where(and(...whereClauses))
    const totalCount = Number(totalRes[0]?.count ?? 0)

    // ordering - basic mapping
    let orderClause: any = undefined
    if (sortBy) {
      const dir = sortOrder === 'asc' ? 'asc' : 'desc'
      if (sortBy === 'name') orderClause = sql`${patient.name} ${dir}`
      else if (sortBy === 'admissionDate') orderClause = sql`${patient.createdAt} ${dir}`
    }

    const rows = await db
      .select({
        id: patient.id,
        name: patient.name,
        dob: patient.dob,
        wardName: ward.name,
        teamName: team.name,
        admissionDate: patient.createdAt,
      })
      .from(patient)
      .leftJoin(ward, eq(patient.wardId, ward.id))
      .leftJoin(team, eq(patient.teamId, team.id))
      .where(and(...whereClauses))
      .limit(pageSize)
      .offset(offset)

    return { data: rows, totalCount }
  } catch (error) {
    console.error('Error fetching paginated patients:', error)
    return { data: [], totalCount: 0 }
  }
}
