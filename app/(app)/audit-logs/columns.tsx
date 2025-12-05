'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'

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

export function columns(onViewDetails: (log: AuditLogRow) => void): ColumnDef<AuditLogRow>[] {
  return [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => {
        const timestamp = row.original.timestamp
        try {
          return format(new Date(timestamp), 'MMM dd, yyyy HH:mm:ss')
        } catch {
          return timestamp
        }
      },
    },
    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => {
        const action = row.original.action
        const actionMap: Record<
          string,
          { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
        > = {
          admit_patient: { label: 'Admit Patient', variant: 'default' },
          discharge_patient: { label: 'Discharge Patient', variant: 'secondary' },
          transfer_patient: { label: 'Transfer Patient', variant: 'outline' },
          record_treatment: { label: 'Record Treatment', variant: 'default' },
          create_doctor: { label: 'Create Doctor', variant: 'default' },
          create_ward: { label: 'Create Ward', variant: 'default' },
          create_team: { label: 'Create Team', variant: 'default' },
          assign_consultant: { label: 'Assign Consultant', variant: 'default' },
        }
        const config = actionMap[action] ?? { label: action, variant: 'outline' as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
      },
    },
    {
      accessorKey: 'entityType',
      header: 'Entity Type',
      cell: ({ row }) => {
        const type = row.original.entityType
        return <span className="capitalize">{type}</span>
      },
    },
    {
      accessorKey: 'entityId',
      header: 'Entity ID',
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => {
        const userName = row.original.userName
        const userRole = row.original.userRole
        return (
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm">{userName || 'Unknown'}</span>
            {userRole && (
              <Badge
                variant={userRole === 'superadmin' ? 'default' : 'secondary'}
                className="w-fit text-xs"
              >
                {userRole}
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(row.original)}
            className="h-8 gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
          </Button>
        )
      },
    },
  ]
}
