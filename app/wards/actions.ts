'use server'

import { db } from '@/db/drizzle'
import { ward } from '@/db/schema'
import { wardSchema } from '@/lib/validators'
import { eq } from 'drizzle-orm'
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
