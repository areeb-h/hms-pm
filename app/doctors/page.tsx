import { CreateDoctorDialog } from '@/components/CreateDoctorDialog'
import { Card, CardContent } from '@/components/ui/card'
import { doctorsSearchParamsCache } from '@/lib/config/table-params'
import { Stethoscope, UserCheck, Users, UserX } from 'lucide-react'
import { createDoctor, getDoctors, getDoctorsPaginated, getTeams } from './actions'
import { DoctorsClient } from './doctors-client'

export default async function DoctorsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const params = await doctorsSearchParamsCache.parse(searchParams)

  const doctors = await getDoctors()
  const doctorsResult = await getDoctorsPaginated({
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: (params.sortOrder as 'asc' | 'desc') || undefined,
    grade: params.grade || undefined,
    teamId: params.teamId || undefined,
  })

  const teamsList = (await getTeams()).map(t => ({ id: t.id, name: t.name }))

  // Calculate totals
  const totalDoctors = doctors.length
  const consultants = doctors.filter(d => d.grade === 'consultant').length
  const assignedDoctors = doctors.filter(d => d.teamId).length
  const unassignedDoctors = doctors.filter(d => !d.teamId).length

  return (
    <>
      {/* Header with Key Metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doctor Management</h1>
          <p className="text-muted-foreground">
            Manage hospital doctors, their grades, and team assignments
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CreateDoctorDialog teams={teamsList} action={createDoctor} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-bold">{totalDoctors}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consultants</p>
                <p className="text-2xl font-bold">{consultants}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Assigned to Teams</p>
                <p className="text-2xl font-bold">{assignedDoctors}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold">{unassignedDoctors}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Doctors Table */}
      <DoctorsClient
        doctors={doctorsResult.data}
        totalCount={doctorsResult.totalCount}
        pageSize={params.pageSize}
      />
    </>
  )
}
