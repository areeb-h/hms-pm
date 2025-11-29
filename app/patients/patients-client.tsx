'use client'

import { ServerTable } from '@/components/server-table'
import { PatientRow, Ward } from '@/types/patients'
import { columns } from './columns'

interface PatientsClientProps {
  patients: PatientRow[]
  totalCount: number
  wards: Ward[]
  teams: { id: number; name: string }[]
  dischargeAction: (formData: FormData) => Promise<void>
  transferAction: (formData: FormData) => Promise<void>
  page: number
  pageSize: number
}

export function PatientsClient({
  patients,
  totalCount,
  wards,
  teams,
  dischargeAction,
  transferAction,
  page,
  pageSize,
}: PatientsClientProps) {
  const filterFields = [
    {
      label: 'Ward',
      paramName: 'ward',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        ...(wards || []).map(w => ({ label: w.name, value: String(w.id) })),
      ],
    },
    {
      label: 'Team',
      paramName: 'team',
      type: 'select' as const,
      options: [
        { label: 'All', value: 'all' },
        ...(teams || []).map(t => ({ label: t.name, value: String(t.id) })),
      ],
    },
  ]

  return (
    <ServerTable
      columns={columns(dischargeAction, transferAction, wards)}
      data={patients}
      totalCount={totalCount}
      searchPlaceholder="Search patients by name..."
      filterFields={filterFields}
      pageSizeOptions={[10, 20, 50]}
      enableSearch={true}
      enableDateFilter={true}
      dateParamNames={['startDate', 'endDate']}
      defaultPageSize={pageSize}
    />
  )
}
