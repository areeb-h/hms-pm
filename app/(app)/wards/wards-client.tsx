'use client'

import { ServerTable } from '@/components/server-table'
import { columns, WardRow } from './columns'

interface WardsClientProps {
  wards: WardRow[]
  totalCount: number
  pageSize: number
}

export function WardsClient({ wards, totalCount, pageSize }: WardsClientProps) {
  const filterFields = [
    {
      label: 'Gender Type',
      paramName: 'genderType',
      type: 'select' as const,
      options: [
        { label: 'All Wards', value: 'all' },
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
      ],
    },
  ]

  return (
    <ServerTable
      columns={columns()}
      data={wards}
      totalCount={totalCount}
      searchPlaceholder="Search wards by name..."
      filterFields={filterFields}
      pageSizeOptions={[10, 20, 50]}
      enableSearch={true}
      defaultPageSize={pageSize}
    />
  )
}
