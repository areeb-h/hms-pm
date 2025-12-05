'use server'

import { db } from '@/db/drizzle'
import { patient, ward } from '@/db/schema'
import { wardSchema } from '@/lib/validators'
import { and, count, eq, like, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function createWard(formData: FormData) {
  const data = {
    name: formData.get('name') as string,
    genderType: formData.get('genderType') as 'male' | 'female',
    capacity: parseInt(formData.get('capacity') as string),
  }

  const validated = wardSchema.safeParse(data)
  if (!validated.success) {
    throw new Error(validated.error.message)
  }

  await db.insert(ward).values(validated.data)
  revalidatePath('/wards')
}

export async function getWards() {
  return await db.select().from(ward)
}

export async function getWard(id: number) {
  const result = await db.select().from(ward).where(eq(ward.id, id))
  return result[0]
}

export async function getWardsPaginated(params: {
  page: number
  pageSize: number
  filter?: string
  sortBy?: string
  sortOrder?: string
  genderType?: string
}) {
  const { page, pageSize, filter, sortBy, sortOrder, genderType } = params

  // Build WHERE conditions
  const conditions = []

  if (filter) {
    conditions.push(like(ward.name, `%${filter}%`))
  }

  if (genderType && genderType !== 'all') {
    conditions.push(eq(ward.genderType, genderType as 'male' | 'female'))
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const totalResult = await db.select({ count: count() }).from(ward).where(whereClause)

  const totalCount = totalResult[0]?.count || 0

  // Get wards with occupancy count
  const wards = await db
    .select({
      id: ward.id,
      name: ward.name,
      genderType: ward.genderType,
      capacity: ward.capacity,
      createdAt: ward.createdAt,
      currentOccupancy: sql<number>`(
        SELECT COUNT(*) FROM ${patient}
        WHERE ${patient.wardId} = ${ward.id}
        AND ${patient.dischargedAt} IS NULL
      )`.as('currentOccupancy'),
    })
    .from(ward)
    .where(whereClause)
    .orderBy(
      sortOrder === 'asc'
        ? sql`${ward[sortBy as keyof typeof ward] || ward.name} ASC`
        : sql`${ward[sortBy as keyof typeof ward] || ward.name} DESC`
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  // Cast genderType to the expected union type
  const typedWards = wards.map(ward => ({
    ...ward,
    genderType: ward.genderType as 'male' | 'female'
  }))

  return {
    data: typedWards,
    totalCount,
  }
}
