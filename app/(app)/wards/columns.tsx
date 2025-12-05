'use client'

import { Badge } from '@/components/ui/badge'

export type WardRow = {
  id: number
  name: string
  genderType: 'male' | 'female'
  capacity: number
  currentOccupancy: number
  createdAt: string
}

export const columns = () => [
  { accessorKey: 'name', header: 'Name', sortable: true },
  {
    id: 'genderType',
    header: 'Gender Type',
    cell: ({ row }: { row: { original: WardRow } }) => (
      <Badge variant={row.original.genderType === 'male' ? 'default' : 'secondary'}>
        {row.original.genderType}
      </Badge>
    ),
    sortable: true,
  },
  {
    id: 'capacity',
    header: 'Capacity',
    cell: ({ row }: { row: { original: WardRow } }) => (
      <span className="text-sm font-medium">{row.original.capacity} beds</span>
    ),
    sortable: true,
  },
  {
    id: 'occupancy',
    header: 'Occupancy',
    cell: ({ row }: { row: { original: WardRow } }) => {
      const percentage = (row.original.currentOccupancy / row.original.capacity) * 100
      const isHigh = percentage >= 80
      const isMedium = percentage >= 50 && percentage < 80

      return (
        <div className="flex items-center gap-2">
          <span className="text-sm">
            {row.original.currentOccupancy} / {row.original.capacity}
          </span>
          <Badge
            variant={isHigh ? 'destructive' : isMedium ? 'default' : 'outline'}
            className="ml-2"
          >
            {percentage.toFixed(0)}%
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const v = getValue() as string | undefined | null
      return v ? new Date(v).toLocaleDateString() : '-'
    },
  },
]
