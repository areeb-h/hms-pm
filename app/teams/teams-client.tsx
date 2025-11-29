'use client'

import { ServerTable } from '@/components/server-table'
import { TeamDetailsModal } from '@/components/TeamDetailsModal'
import { TeamRow } from '@/types/patients'
import { useState } from 'react'
import { columns } from './columns'

interface TeamsClientProps {
  teams: TeamRow[]
  totalCount: number
  pageSize: number
}

export function TeamsClient({ teams, totalCount, pageSize }: TeamsClientProps) {
  const [selectedTeam, setSelectedTeam] = useState<TeamRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleViewTeam = (team: TeamRow) => {
    setSelectedTeam(team)
    setModalOpen(true)
  }

  const filterFields = [
    {
      label: 'Consultant Status',
      paramName: 'hasConsultant',
      type: 'select' as const,
      options: [
        { label: 'All Teams', value: 'all' },
        { label: 'Has Consultant', value: 'true' },
        { label: 'No Consultant', value: 'false' },
      ],
    },
  ]

  return (
    <>
      <ServerTable
        columns={columns(handleViewTeam)}
        data={teams}
        totalCount={totalCount}
        searchPlaceholder="Search teams by name or code..."
        filterFields={filterFields}
        pageSizeOptions={[10, 20, 50]}
        enableSearch={true}
        defaultPageSize={pageSize}
      />

      <TeamDetailsModal team={selectedTeam} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
