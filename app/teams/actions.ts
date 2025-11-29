'use server'
import { db } from '@/db/drizzle'
import { doctor, patient, team, teamConsultant, ward } from '@/db/schema'
import { doctorSchema, teamSchema } from '@/lib/validators'
import { and, eq, isNull, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createTeam(formData: FormData) {
  const data = {
    code: formData.get('code') as string,
    name: formData.get('name') as string,
  }

  const validated = teamSchema.safeParse(data)
  if (!validated.success) {
    throw new Error(validated.error.message)
  }

  await db.insert(team).values(validated.data)
  revalidatePath('/teams')
}

export async function getTeams() {
  return await db.select().from(team)
}

export async function getConsultants() {
  return await db.select().from(doctor).where(eq(doctor.grade, 'consultant'))
}

export async function createDoctor(formData: FormData) {
  const teamIdValue = formData.get('teamId') as string

  const data = {
    name: formData.get('name') as string,
    grade: formData.get('grade') as 'consultant' | 'junior1' | 'junior2',
    teamId:
      teamIdValue && teamIdValue !== '' && teamIdValue !== 'null'
        ? parseInt(teamIdValue)
        : undefined,
  }

  const validated = doctorSchema.safeParse(data)
  if (!validated.success) {
    throw new Error(validated.error.message)
  }

  // If consultant, check if team already has a consultant
  if (validated.data.grade === 'consultant') {
    if (!validated.data.teamId) {
      throw new Error('Consultants must be assigned to a team')
    }
    const existingConsultant = await db
      .select()
      .from(teamConsultant)
      .where(eq(teamConsultant.teamId, validated.data.teamId))
    if (existingConsultant.length > 0) {
      throw new Error('Team already has a consultant')
    }
  }

  const doctorResult = await db.insert(doctor).values(validated.data).returning({ id: doctor.id })

  // If consultant, link to team
  if (validated.data.grade === 'consultant') {
    await db.insert(teamConsultant).values({
      teamId: validated.data.teamId!,
      doctorId: doctorResult[0].id,
    })
  }

  revalidatePath('/teams')
}

export async function getDoctors() {
  return await db.select().from(doctor)
}

export async function getTeamsPaginated({
  page = 1,
  pageSize = 10,
  sortBy = 'name',
  sortOrder = 'asc',
  filter = '',
  grade,
  hasConsultant,
}: {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
  filter?: string
  grade?: string
  hasConsultant?: string
}) {
  // Build where conditions
  const whereConditions = []

  if (filter) {
    whereConditions.push(
      sql`(${team.name} LIKE ${`%${filter}%`} OR ${team.code} LIKE ${`%${filter}%`})`
    )
  }

  if (hasConsultant === 'true') {
    whereConditions.push(sql`EXISTS (
      SELECT 1 FROM ${teamConsultant} tc
      WHERE tc.team_id = ${team.id}
    )`)
  } else if (hasConsultant === 'false') {
    whereConditions.push(sql`NOT EXISTS (
      SELECT 1 FROM ${teamConsultant} tc
      WHERE tc.team_id = ${team.id}
    )`)
  }

  const offset = Math.max(0, (page - 1) * pageSize)

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(team)
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

  const totalCount = totalResult[0]?.count ?? 0

  // Build order clause
  let orderClause: ReturnType<typeof sql> | undefined = undefined
  if (sortBy === 'name') {
    orderClause = sortOrder === 'asc' ? sql`${team.name} ASC` : sql`${team.name} DESC`
  } else if (sortBy === 'code') {
    orderClause = sortOrder === 'asc' ? sql`${team.code} ASC` : sql`${team.code} DESC`
  }

  // Get teams with doctor counts and consultant info
  const baseQuery = db
    .select({
      id: team.id,
      code: team.code,
      name: team.name,
      createdAt: team.createdAt,
      doctorCount: sql<number>`COUNT(${doctor.id})`,
      consultantCount: sql<number>`COUNT(CASE WHEN ${doctor.grade} = 'consultant' THEN 1 END)`,
      consultantName: sql<string>`MAX(CASE WHEN ${doctor.grade} = 'consultant' THEN ${doctor.name} ELSE NULL END)`,
    })
    .from(team)
    .leftJoin(doctor, eq(team.id, doctor.teamId))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .groupBy(team.id, team.code, team.name, team.createdAt)
    .limit(pageSize)
    .offset(offset)

  const teamsData = orderClause ? await baseQuery.orderBy(orderClause) : await baseQuery

  return {
    data: teamsData,
    totalCount,
  }
}

export async function getTeamDetails(teamId: number) {
  // Get team info
  const teamInfo = await db.select().from(team).where(eq(team.id, teamId))
  if (!teamInfo.length) return null

  // Get doctors in the team
  const doctors = await db
    .select({
      id: doctor.id,
      name: doctor.name,
      grade: doctor.grade,
    })
    .from(doctor)
    .where(eq(doctor.teamId, teamId))

  // Get patients assigned to the team
  const patients = await db
    .select({
      id: patient.id,
      name: patient.name,
      dob: patient.dob,
      gender: patient.gender,
      wardName: ward.name,
      admissionDate: patient.createdAt,
    })
    .from(patient)
    .leftJoin(ward, eq(patient.wardId, ward.id))
    .where(and(eq(patient.teamId, teamId), isNull(patient.dischargedAt)))

  return {
    team: teamInfo[0],
    doctors,
    patients,
  }
}
