'use client'

import { ActionDropdown } from '@/components/action-dropdown'
import { PatientColumns, PatientRow, Ward } from '@/types/patients'
import { ArrowRightLeft, UserMinus } from 'lucide-react'
import { useState } from 'react'
import { DischargePatientDialog } from './discharge-patient-dialog'
import { TransferPatientDialog } from './transfer-patient-dialog'

const calculateAge = (dob: string | null | undefined) => {
  if (!dob) return '-'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age.toString()
}

const ActionsCell = ({
  row,
  dischargeAction,
  transferAction,
  wards,
}: {
  row: { original: PatientRow }
  dischargeAction: (formData: FormData) => Promise<void>
  transferAction: (formData: FormData) => Promise<void>
  wards: Ward[]
}) => {
  const id = row.original.id
  const [transferOpen, setTransferOpen] = useState(false)
  const [dischargeOpen, setDischargeOpen] = useState(false)
  const formId = `discharge-${id}`
  const actions = [
    {
      id: 'transfer',
      label: 'Transfer',
      icon: ArrowRightLeft,
      onClick: () => setTransferOpen(true),
    },
    {
      id: 'discharge',
      label: 'Discharge',
      icon: UserMinus,
      variant: 'destructive' as const,
      onClick: () => setDischargeOpen(true),
    },
  ]
  return (
    <div className="flex items-center gap-2">
      <form id={formId} action={dischargeAction}>
        <input type="hidden" name="patientId" value={String(id)} />
      </form>
      <ActionDropdown actions={actions} />
      <TransferPatientDialog
        wards={wards}
        action={transferAction}
        patientId={id}
        open={transferOpen}
        onOpenChange={setTransferOpen}
      />
      <DischargePatientDialog
        action={dischargeAction}
        patientId={id}
        open={dischargeOpen}
        onOpenChange={setDischargeOpen}
      />
    </div>
  )
}

export const columns = (
  dischargeAction: (formData: FormData) => Promise<void>,
  transferAction: (formData: FormData) => Promise<void>,
  wards: Ward[]
): PatientColumns => [
  { accessorKey: 'name', header: 'Name' },
  {
    accessorKey: 'dob',
    header: 'DOB',
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const v = getValue() as string | undefined | null
      return v ? new Date(v).toLocaleDateString('en-US') : '-'
    },
  },
  {
    id: 'age',
    header: 'Age',
    cell: ({ row }: { row: { original: PatientRow } }) => calculateAge(row.original.dob),
  },
  { accessorKey: 'wardName', header: 'Ward' },
  { accessorKey: 'teamName', header: 'Team' },
  {
    accessorKey: 'admissionDate',
    header: 'Admission Date',
    cell: ({ getValue }: { getValue: () => unknown }) => {
      const v = getValue() as string | undefined | null
      return v ? new Date(v).toLocaleDateString('en-US') : '-'
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        dischargeAction={dischargeAction}
        transferAction={transferAction}
        wards={wards}
      />
    ),
  },
]
