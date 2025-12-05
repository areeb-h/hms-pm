import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { auditLogsSearchParamsCache } from '@/lib/config/table-params'
import { redirect } from 'next/navigation'
import { getAuditLogsPaginated } from './actions'
import { AuditLogsClient } from './audit-logs-client'

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Check if user is logged in and has superadmin role
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'superadmin') {
    redirect('/')
  }

  const params = await searchParams
  const search = auditLogsSearchParamsCache.parse(params)

  const { data: auditLogs, total } = await getAuditLogsPaginated(search)

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">View all system activity and changes</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AuditLogsClient auditLogs={auditLogs} total={total} />
    </>
  )
}
