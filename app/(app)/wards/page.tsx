import { CreateWardDialog } from '@/components/CreateWardDialog'
import { Card, CardContent } from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { patient } from '@/db/schema'
import { wardsSearchParamsCache } from '@/lib/config/table-params'
import { isNull } from 'drizzle-orm'
import { Activity, BedDouble, Building, Users } from 'lucide-react'
import { createWard, getWards, getWardsPaginated } from './actions'
import { WardsClient } from './wards-client'

export default async function WardsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const searchParams = await props.searchParams
  const params = await wardsSearchParamsCache.parse(searchParams)

  const allWards = await getWards()
  const wardsResult = await getWardsPaginated({
    page: params.page,
    pageSize: params.pageSize,
    filter: params.filter || undefined,
    sortBy: params.sortBy || undefined,
    sortOrder: params.sortOrder || undefined,
    genderType: params.genderType || undefined,
  })

  // Calculate totals
  const totalWards = allWards.length
  const totalCapacity = allWards.reduce((sum, w) => sum + w.capacity, 0)

  // Get all active patients count
  const activePatientsResult = await db.select().from(patient).where(isNull(patient.dischargedAt))

  const totalOccupied = activePatientsResult.length
  const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0

  return (
    <>
      {/* Header with Key Metrics */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ward Management</h1>
          <p className="text-muted-foreground">
            Manage hospital wards, capacity, and bed occupancy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <CreateWardDialog action={createWard} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Wards</p>
                <p className="text-2xl font-bold">{totalWards}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
                <p className="text-2xl font-bold">{totalCapacity} beds</p>
              </div>
              <BedDouble className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupied Beds</p>
                <p className="text-2xl font-bold">{totalOccupied}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Occupancy Rate</p>
                <p className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wards Table */}
      <WardsClient
        wards={wardsResult.data}
        totalCount={wardsResult.totalCount}
        pageSize={params.pageSize}
      />
    </>
  )
}
