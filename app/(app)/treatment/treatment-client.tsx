'use client'

import { ServerTable } from '@/components/server-table'
import { columns } from './columns'

interface TreatmentClientProps {
  treatments: any[]
  total: number
}

export function TreatmentClient({ treatments, total }: TreatmentClientProps) {
  return (
    <ServerTable
      columns={columns()}
      data={treatments}
      totalCount={total}
      searchPlaceholder="Search treatments by patient, doctor..."
      enableSearch={true}
      pageSizeOptions={[10, 20, 50]}
    />
  )
}
