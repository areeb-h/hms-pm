import { AdmitPatientDialog } from '@/components/AdmitPatientDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { patientsSearchParamsCache } from '@/lib/config/table-params'
import { Building, UserPlus, Users } from 'lucide-react'
import {
  admitPatient,
  dischargePatient,
  getPatients,
  getPatientsByTeam,
  getPatientsByWard,
  getTeams,
  getWards,
  transferPatient,
} from './actions'
import { PatientsClient } from './patients-client'

export default async function PatientsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const params = await patientsSearchParamsCache.parse(searchParams)

  const wards = await getWards()
  const teams = await getTeams()

  const patientsResult = await getPatients({
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || null,
    ward: params.ward || null,
    team: params.team || null,
    sortBy: params.sortBy || null,
    sortOrder: params.sortOrder || null,
    startDate: params.startDate || null,
    endDate: params.endDate || null,
  })

  const allWardPatients = await Promise.all(
    wards.map(async ward => ({
      ...ward,
      patients: await getPatientsByWard(ward.id),
    }))
  )

  const allTeamPatients = await Promise.all(
    teams.map(async team => ({
      ...team,
      patients: await getPatientsByTeam(team.id),
    }))
  )

  const wardsList = wards.map(w => ({ id: w.id, name: w.name }))
  const teamsList = teams.map(t => ({ id: t.id, name: t.name }))

  // Calculate totals (overall active patients matching current filters)
  const totalPatients = patientsResult.totalCount
  const occupiedWards = allWardPatients.filter(ward => ward.patients.length > 0).length

  // helper server-action wrappers for list discharge (return void)
  async function dischargeFromList(formData: FormData) {
    'use server'
    await dischargePatient(formData)
  }

  async function transferFromList(formData: FormData) {
    'use server'
    await transferPatient(formData)
  }

  return (
    <>
      {/* Header with Key Metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient admissions, transfers, and discharges across wards and teams
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AdmitPatientDialog wards={wardsList} teams={teamsList} action={admitPatient}>
            <Button size="sm" className="gap-2">
              <UserPlus className="h-5 w-5" />
              Admit Patient
            </Button>
          </AdmitPatientDialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold">{totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Wards</p>
                <p className="text-2xl font-bold">
                  {occupiedWards} / {wards.length}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                <p className="text-2xl font-bold">{teams.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified Patients Table */}
      <PatientsClient
        patients={patientsResult.data}
        totalCount={patientsResult.totalCount}
        wards={wards}
        teams={teamsList}
        dischargeAction={dischargeFromList}
        transferAction={transferFromList}
        page={params.page}
        pageSize={params.pageSize}
      />
    </>
  )
}
