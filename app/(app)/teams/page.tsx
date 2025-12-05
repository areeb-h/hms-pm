import { CreateDoctorDialog } from '@/components/CreateDoctorDialog'
import { CreateTeamDialog } from '@/components/CreateTeamDialog'
import { Card, CardContent } from '@/components/ui/card'
import { getCurrentUser } from '@/lib/auth'
import { teamsSearchParamsCache } from '@/lib/config/table-params'
import { Stethoscope, UserCheck, Users } from 'lucide-react'
import {
  createDoctor,
  createTeam,
  getConsultants,
  getDoctors,
  getTeams,
  getTeamsPaginated,
} from './actions'
import { TeamsClient } from './teams-client'

export default async function TeamsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const user = await getCurrentUser()
  const searchParams = await props.searchParams
  const params = await teamsSearchParamsCache.parse(searchParams)

  const consultantsData = await getConsultants()
  const doctors = await getDoctors()
  const teamsResult = await getTeamsPaginated({
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: params.sortOrder || undefined,
    grade: params.grade || undefined,
    hasConsultant: params.hasConsultant || undefined,
  })

  const consultants = consultantsData.map(c => ({ id: c.id, name: c.name }))
  const teamsList = (await getTeams()).map(t => ({ id: t.id, name: t.name }))

  // Calculate totals
  const totalTeams = teamsResult.totalCount
  const totalDoctors = doctors.length
  const teamsWithConsultants = doctors.filter(d => d.grade === 'consultant' && d.teamId).length
  const unassignedDoctors = doctors.filter(d => !d.teamId).length

  return (
    <>
      {/* Header with Key Metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage hospital teams, doctors, and consultant assignments
          </p>
        </div>
        {user?.role === 'superadmin' && (
          <div className="flex flex-wrap items-center gap-3">
            <CreateTeamDialog consultants={consultants} action={createTeam} />
            <CreateDoctorDialog teams={teamsList} action={createDoctor} />
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                <p className="text-2xl font-bold">{totalTeams}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-bold">{totalDoctors}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teams with Consultants</p>
                <p className="text-2xl font-bold">{teamsWithConsultants}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unassigned Doctors</p>
                <p className="text-2xl font-bold">{unassignedDoctors}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Table */}
      <TeamsClient
        teams={teamsResult.data}
        totalCount={teamsResult.totalCount}
        pageSize={params.pageSize}
      />
    </>
  )
}
