'use server'

import { db } from '@/db/drizzle'
import { user } from '@/db/schema'
import { setUserSession } from '@/lib/auth'
import { eq } from 'drizzle-orm'

interface LoginParams {
  email: string
  password: string
}

export async function loginAction(
  params: LoginParams
): Promise<{ success: boolean; message?: string }> {
  try {
    const { email, password } = params

    // Find user by email
    const users = await db.select().from(user).where(eq(user.email, email)).limit(1)

    if (users.length === 0) {
      return { success: false, message: 'Invalid email or password' }
    }

    const foundUser = users[0]

    // In production, use bcrypt.compare(password, foundUser.password)
    // For demo purposes, we're doing direct comparison
    if (foundUser.password !== password) {
      return { success: false, message: 'Invalid email or password' }
    }

    // Store user session
    await setUserSession(foundUser.id)

    return { success: true }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, message: 'An error occurred during login' }
  }
}

export async function logoutAction() {
  const { clearUserSession } = await import('@/lib/auth')
  await clearUserSession()
}
