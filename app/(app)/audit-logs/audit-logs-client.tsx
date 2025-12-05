'use client'

import { AuditLogDetailsModal } from '@/components/AuditLogDetailsModal'
import { ServerTable } from '@/components/server-table'
import { useState } from 'react'
import { columns } from './columns'

interface AuditLogRow {
  id: number
  action: string
  entityType: string
  entityId: number | string
  userId: number
  userName: string | null
  userEmail: string | null
  userRole: string | null
  details: string | null
  timestamp: string
}

interface AuditLogsClientProps {
  auditLogs: Array<AuditLogRow>
  total: number
}

export function AuditLogsClient({ auditLogs, total }: AuditLogsClientProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogRow | null>(null)

  return (
    <>
      <ServerTable
        columns={columns(log => setSelectedLog(log))}
        data={auditLogs}
        totalCount={total}
        searchPlaceholder="Search audit logs by action, entity..."
        enableSearch={true}
        pageSizeOptions={[10, 20, 50]}
      />

      {selectedLog && (
        <AuditLogDetailsModal
          open={!!selectedLog}
          onOpenChange={open => !open && setSelectedLog(null)}
          auditLog={selectedLog}
        />
      )}
    </>
  )
}
