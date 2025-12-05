import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Building, Calendar, Clock, Stethoscope, User, Users } from 'lucide-react'
import { getDashboardStats, getRecentActivity } from './dashboard-actions'

export default async function DashboardPage() {
  const stats = await getDashboardStats()
  const activity = await getRecentActivity()

  // Calculate occupancy rate
  const totalCapacity = stats.wardOccupancy.reduce((sum, ward) => sum + (ward.capacity || 0), 0)
  const totalOccupied = stats.wardOccupancy.reduce((sum, ward) => sum + ward.patientCount, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to MediCare Hospital Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">+{stats.recentPatients} this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ward Occupancy</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              {totalOccupied}/{totalCapacity} beds occupied
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeams}</div>
            <p className="text-xs text-muted-foreground">{stats.totalDoctors} doctors total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatments</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTreatments}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Gender Distribution */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Patient Demographics</CardTitle>
            <CardDescription>Gender distribution of current patients</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.genderStats.map(stat => (
              <div key={stat.gender} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{stat.gender === 'male' ? 'M' : 'F'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium capitalize">{stat.gender}</p>
                    <p className="text-xs text-muted-foreground">{stat.count} patients</p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {stats.totalPatients > 0
                    ? Math.round((stat.count / stats.totalPatients) * 100)
                    : 0}
                  %
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient admissions and treatments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Recent Admissions */}
              {activity.recentAdmissions.slice(0, 3).map(admission => (
                <div key={admission.id} className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {admission.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{admission.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Admitted to {admission.wardName || 'Unknown Ward'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {new Date(admission.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}

              {/* Recent Treatments */}
              {activity.recentTreatments.slice(0, 2).map(treatment => (
                <div key={treatment.id} className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Treatment for {treatment.patientName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by Dr. {treatment.doctorName || 'Unknown'}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {new Date(treatment.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ward Occupancy Details */}
      <Card>
        <CardHeader>
          <CardTitle>Ward Occupancy</CardTitle>
          <CardDescription>Current bed occupancy across all wards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.wardOccupancy.map(ward => {
              const capacity = ward.capacity || 0
              const occupancyPercent =
                capacity > 0 ? Math.round((ward.patientCount / capacity) * 100) : 0

              return (
                <div
                  key={ward.wardId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ward.wardName}</p>
                    <p className="text-sm text-muted-foreground">
                      {ward.patientCount}/{capacity} beds
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">{occupancyPercent}%</p>
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPercent > 90
                            ? 'bg-red-500'
                            : occupancyPercent > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
