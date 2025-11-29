import { ColumnDef } from '@tanstack/react-table'

export interface PatientRow {
  id: number
  name: string
  dob?: string | null
  wardName?: string | null
  teamName?: string | null
  admissionDate?: string | null
}

export interface DoctorRow {
  id: number
  name: string
  grade: string
  teamId?: number | null
  teamName?: string | null
  teamCode?: string | null
}

export interface TeamRow {
  id: number
  code: string
  name: string
  createdAt: string
  doctorCount: number
  consultantCount: number
  consultantName: string
}

export type PatientColumns = ColumnDef<PatientRow>[]
