'use server'

import { db } from '@/db/drizzle'
import { doctor, team } from '@/db/schema'
import { doctorSchema } from '@/lib/validators'
import { and, eq, like, or, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createDoctor(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    grade: formData.get('grade') as string,
    teamId: formData.get('teamId') ? parseInt(formData.get('teamId') as string) : null,
  }

  const validatedData = doctorSchema.parse(data)

  await db.insert(doctor).values({
    name: validatedData.name,
    grade: validatedData.grade,
    teamId: validatedData.teamId,
  })

  revalidatePath('/doctors')
}

export async function getDoctors() {
  return await db.select().from(doctor)
}

export async function getDoctorsPaginated({
  page = 1,
  pageSize = 10,
  filter,
  sortBy,
  sortOrder = 'asc',
  grade,
  teamId,
}: {
  page?: number
  pageSize?: number
  filter?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  grade?: string
  teamId?: string
}) {
  const offset = (page - 1) * pageSize

  // Build where conditions
  const whereConditions = []
  if (filter) {
    whereConditions.push(or(like(doctor.name, `%${filter}%`), like(doctor.grade, `%${filter}%`)))
  }
  if (grade && grade !== 'all') {
    whereConditions.push(eq(doctor.grade, grade))
  }
  if (teamId && teamId !== 'all') {
    whereConditions.push(eq(doctor.teamId, parseInt(teamId)))
  }

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(doctor)
    .leftJoin(team, eq(doctor.teamId, team.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)

  const totalCount = totalResult[0]?.count ?? 0

  // Build order clause
  let orderClause: ReturnType<typeof sql> | undefined = undefined
  if (sortBy === 'name') {
    orderClause = sortOrder === 'asc' ? sql`${doctor.name} ASC` : sql`${doctor.name} DESC`
  } else if (sortBy === 'grade') {
    orderClause = sortOrder === 'asc' ? sql`${doctor.grade} ASC` : sql`${doctor.grade} DESC`
  }

  // Get doctors with team info
  const baseQuery = db
    .select({
      id: doctor.id,
      name: doctor.name,
      grade: doctor.grade,
      teamId: doctor.teamId,
      teamName: team.name,
      teamCode: team.code,
    })
    .from(doctor)
    .leftJoin(team, eq(doctor.teamId, team.id))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .limit(pageSize)
    .offset(offset)

  const doctorsData = orderClause ? await baseQuery.orderBy(orderClause) : await baseQuery

  return {
    data: doctorsData,
    totalCount,
  }
}

export async function getTeams() {
  return await db.select().from(team)
}
