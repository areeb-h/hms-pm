'use client'

import { ImprovedPatientDetailsDialog } from '@/components/ImprovedPatientDetailsDialog'
import { ServerTable } from '@/components/server-table'
import { PatientRow, Ward } from '@/types/patients'
import { useState } from 'react'
import {
  getDoctorsForTreatment,
  getPatientTreatmentsAction,
  recordTreatmentFromPatient,
} from './actions'
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
  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [treatments, setTreatments] = useState<
    {
      id: number
      doctorName: string
      doctorGrade: string
      teamName: string | null
      description: string
      notes: string | null
      treatmentDate: string
      createdAt: string
    }[]
  >([])
  const [doctors, setDoctors] = useState<
    { id: number; name: string; grade: string; teamName: string | null }[]
  >([])

  const handleViewDetails = async (patient: PatientRow) => {
    setSelectedPatient(patient)
    setDetailsOpen(true)
    // Fetch treatments and doctors for this patient
    const [patientTreatments, availableDoctors] = await Promise.all([
      getPatientTreatmentsAction(patient.id),
      getDoctorsForTreatment(),
    ])
    setTreatments(patientTreatments)
    setDoctors(availableDoctors)
  }

  const handleTreatmentAdded = async () => {
    if (selectedPatient) {
      const patientTreatments = await getPatientTreatmentsAction(selectedPatient.id)
      setTreatments(patientTreatments)
    }
  }

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
    <>
      <ServerTable
        columns={columns(dischargeAction, transferAction, wards, handleViewDetails)}
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

      <ImprovedPatientDetailsDialog
        patient={selectedPatient}
        treatments={treatments}
        doctors={doctors}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onTreatmentAdded={handleTreatmentAdded}
        recordTreatmentAction={recordTreatmentFromPatient}
      />
    </>
  )
}
