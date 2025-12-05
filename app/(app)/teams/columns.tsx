'use client'

import { Button } from '@/components/ui/button'
import { TeamRow } from '@/types/patients'
import { Eye, Users } from 'lucide-react'

export const columns = (onViewTeam?: (team: TeamRow) => void): any[] => [
  { accessorKey: 'code', header: 'Code', sortable: true },
  { accessorKey: 'name', header: 'Name', sortable: true },
  {
    id: 'doctors',
    header: 'Doctors',
    cell: ({ row }: { row: { original: TeamRow } }) => (
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span>{row.original.doctorCount}</span>
      </div>
    ),
  },
  {
    id: 'consultant',
    header: 'Consultant',
    cell: ({ row }: { row: { original: TeamRow } }) => (
      <span className="text-sm">{row.original.consultantName || 'None'}</span>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const v = getValue() as string | undefined | null
      return v ? new Date(v).toLocaleDateString() : '-'
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: { row: { original: TeamRow } }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewTeam?.(row.original)}
        className="h-8 w-8 p-0"
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
]
