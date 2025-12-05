'use client'

import { ServerTable } from '@/components/server-table'
import { DoctorRow } from '@/types/patients'
import { columns } from './columns'

interface DoctorsClientProps {
  doctors: DoctorRow[]
  totalCount: number
  pageSize: number
}

export function DoctorsClient({ doctors, totalCount, pageSize }: DoctorsClientProps) {
  const filterFields = [
    {
      label: 'Grade',
      paramName: 'grade',
      type: 'select' as const,
      options: [
        { label: 'All Grades', value: 'all' },
        { label: 'Consultant', value: 'consultant' },
        { label: 'Junior 1', value: 'junior1' },
        { label: 'Junior 2', value: 'junior2' },
      ],
    },
    {
      label: 'Team Assignment',
      paramName: 'teamId',
      type: 'select' as const,
      options: [
        { label: 'All Doctors', value: 'all' },
        { label: 'Assigned to Team', value: 'assigned' },
        { label: 'Unassigned', value: 'unassigned' },
      ],
    },
  ]

  return (
    <ServerTable
      columns={columns()}
      data={doctors}
      totalCount={totalCount}
      searchPlaceholder="Search doctors by name or grade..."
      filterFields={filterFields}
      pageSizeOptions={[10, 20, 50]}
      enableSearch={true}
      defaultPageSize={pageSize}
    />
  )
}
