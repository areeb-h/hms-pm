'use client'

import { Badge } from '@/components/ui/badge'
import { DoctorRow } from '@/types/patients'

export const columns = (): any[] => [
  { accessorKey: 'name', header: 'Name', sortable: true },
  {
    id: 'grade',
    header: 'Grade',
    cell: ({ row }: { row: { original: DoctorRow } }) => (
      <Badge
        variant={
          row.original.grade === 'consultant'
            ? 'default'
            : row.original.grade === 'junior1'
            ? 'secondary'
            : 'outline'
        }
      >
        {row.original.grade}
      </Badge>
    ),
    sortable: true,
  },
  {
    id: 'team',
    header: 'Team',
    cell: ({ row }: { row: { original: DoctorRow } }) => (
      <span className="text-sm">
        {row.original.teamName
          ? `${row.original.teamCode} - ${row.original.teamName}`
          : 'Unassigned'}
      </span>
    ),
  },
]
