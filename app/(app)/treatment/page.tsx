import { AssignTreatmentDialog } from '@/components/AssignTreatmentDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { treatmentsSearchParamsCache } from '@/lib/config/table-params'
import { Activity, FileText, Stethoscope, Users } from 'lucide-react'
import {
  getDoctors,
  getPatients,
  getTreatments,
  getTreatmentsPaginated,
  recordTreatment,
} from './actions'
import { TreatmentClient } from './treatment-client'

export default async function TreatmentPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const params = await treatmentsSearchParamsCache.parse(searchParams)

  const patients = await getPatients()
  const doctors = await getDoctors()
  const allTreatments = await getTreatments()

  const treatmentsResult = await getTreatmentsPaginated({
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: (params.sortOrder as 'asc' | 'desc') || undefined,
  })

  // Calculate totals from all treatments
  const totalTreatments = allTreatments.length
  const uniquePatients = new Set(allTreatments.map(t => t.patientId)).size
  const uniqueDoctors = new Set(allTreatments.map(t => t.doctorId)).size

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Treatment Management</h1>
          <p className="text-muted-foreground">
            Record and track patient treatments by medical team
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AssignTreatmentDialog patients={patients} doctors={doctors} action={recordTreatment}>
            <Button size="sm" className="gap-2">
              <Stethoscope className="h-5 w-5" />
              Record Treatment
            </Button>
          </AssignTreatmentDialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Treatments</p>
                <p className="text-2xl font-bold">{totalTreatments}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patients Treated</p>
                <p className="text-2xl font-bold">{uniquePatients}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Doctors</p>
                <p className="text-2xl font-bold">{uniqueDoctors}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatments Table */}
      <TreatmentClient treatments={treatmentsResult.data} total={treatmentsResult.total} />
    </>
  )
}
