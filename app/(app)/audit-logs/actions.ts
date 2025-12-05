'use server'

import { db } from '@/db/drizzle'
import { auditLog, user } from '@/db/schema'
import { auditLogsSearchParamsCache } from '@/lib/config/table-params'
import { desc, count as drizzleCount, eq } from 'drizzle-orm'

export async function getAuditLogsPaginated(
  params: Awaited<ReturnType<typeof auditLogsSearchParamsCache.parse>>
) {
  const { page, limit, sort } = params
  const offset = (page - 1) * limit

  const [sortBy, sortDir] = (sort ?? 'timestamp.desc').split('.') as [string, 'asc' | 'desc']

  const orderClause = sortDir === 'asc' ? auditLog.timestamp : desc(auditLog.timestamp)

  const [data, [{ count: totalCount }]] = await Promise.all([
    db
      .select({
        id: auditLog.id,
        action: auditLog.action,
        entityType: auditLog.entityType,
        entityId: auditLog.entityId,
        userId: auditLog.userId,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        details: auditLog.details,
        timestamp: auditLog.timestamp,
      })
      .from(auditLog)
      .leftJoin(user, eq(auditLog.userId, user.id))
      .orderBy(orderClause)
      .limit(limit)
      .offset(offset),
    db.select({ count: drizzleCount() }).from(auditLog),
  ])

  return {
    data: data.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    })),
    total: totalCount,
  }
}
