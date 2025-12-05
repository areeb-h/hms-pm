import { db } from '@/db/drizzle'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

export interface User {
  id: number
  email: string
  name: string
  role: 'admin' | 'superadmin'
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('user_id')?.value

    if (!userId) {
      return null
    }

    const users = await db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(eq(user.id, parseInt(userId)))
      .limit(1)

    return users[0] || null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function setUserSession(userId: number) {
  const cookieStore = await cookies()
  cookieStore.set('user_id', userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_id')
}
