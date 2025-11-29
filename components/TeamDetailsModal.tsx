'use client'

import {
  Dialog,
  DialogBody,
  DialogDivider,
  DialogHeader,
  DialogSection,
} from '@/components/custom-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TeamRow } from '@/types/patients'
import { Calendar, Loader2, Stethoscope, UserCheck, Users, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getTeamDetails } from '../app/teams/actions'

interface TeamDetailsModalProps {
  team: TeamRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface TeamDetails {
  team: {
    id: number
    code: string
    name: string
    createdAt: string
  }
  doctors: Array<{
    id: number
    name: string
    grade: string
  }>
  patients: Array<{
    id: number
    name: string
    dob?: string | null
    gender: string
    wardName?: string | null
    admissionDate?: string | null
  }>
}

export function TeamDetailsModal({ team, open, onOpenChange }: TeamDetailsModalProps) {
  const [details, setDetails] = useState<TeamDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadDetails = async () => {
      if (team && open) {
        setLoading(true)
        setError(false)
        try {
          const data = await getTeamDetails(team.id)
          setDetails(data)
        } catch (err) {
          console.error('Failed to load team details:', err)
          setError(true)
        } finally {
          setLoading(false)
        }
      }
    }
    loadDetails()
  }, [team, open])

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setDetails(null)
      setError(false)
    }
  }, [open])

  if (!team) return null

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={Users}
      iconColor="primary"
      maxWidth="900px"
      className="h-[90vh]"
    >
      <DialogHeader
        title={team.name}
        description={`View team information, assigned medical staff, and current patients`}
      />

      <DialogBody scrollable fullHeight>
        {loading ? (
          <div className="flex flex-col justify-center items-center py-16">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm font-medium text-foreground">Loading team details...</p>
            <p className="text-xs text-muted-foreground mt-1">Please wait</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Failed to load team details</p>
            <p className="text-xs text-muted-foreground mb-4">
              Please try again or contact support if the issue persists
            </p>
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        ) : details ? (
          <div className="space-y-6">
            {/* Team Information */}
            <DialogSection
              title="Team Information"
              description="Basic team details and creation information"
            >
              <Card className="p-0 border border-border/50 shadow-sm bg-card">
                <CardContent className="p-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Team Code
                      </p>
                      <p className="text-base font-semibold text-foreground">{details.team.code}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Team Name
                      </p>
                      <p className="text-base font-semibold text-foreground">{details.team.name}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Created Date
                      </p>
                      <p className="text-sm text-foreground">
                        {new Date(details.team.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Consultant
                      </p>
                      <p className="text-sm text-foreground">
                        {team.consultantName || (
                          <span className="text-muted-foreground italic">Not assigned</span>
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </DialogSection>

            <DialogDivider />

            {/* Tabs for Doctors and Patients */}
            <Tabs defaultValue="staff" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="staff" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Medical Staff
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5">
                    {details.doctors.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="patients" className="gap-2">
                  <Users className="h-4 w-4" />
                  Patients
                  <Badge variant="secondary" className="ml-1.5 h-5 min-w-5 px-1.5">
                    {details.patients.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              {/* Medical Staff Tab */}
              <TabsContent value="staff" className="mt-6 space-y-4">
                {details.doctors.length === 0 ? (
                  <Card className="p-0 border-0 shadow-none bg-muted/40">
                    <CardContent className="p-10 text-center">
                      <div className="inline-flex items-center justify-center rounded-full bg-muted p-5 mb-4">
                        <UserCheck className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground mb-1.5">
                        No Medical Staff Assigned
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This team currently has no doctors or consultants assigned. Medical staff
                        can be assigned through the team management interface.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {details.doctors.map(doctor => (
                      <Card
                        key={doctor.id}
                        className="p-0 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                                <UserCheck className="h-6 w-6 text-primary" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold text-foreground truncate mb-0.5">
                                  {doctor.name}
                                </p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {doctor.grade}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={doctor.grade === 'consultant' ? 'default' : 'secondary'}
                              className="ml-3 flex-shrink-0 capitalize px-3 py-1"
                            >
                              {doctor.grade}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Patients Tab */}
              <TabsContent value="patients" className="mt-6 space-y-4">
                {details.patients.length === 0 ? (
                  <Card className="p-0 border-0 shadow-none bg-muted/40">
                    <CardContent className="p-10 text-center">
                      <div className="inline-flex items-center justify-center rounded-full bg-muted p-5 mb-4">
                        <Users className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <p className="text-base font-semibold text-foreground mb-1.5">
                        No Active Patients
                      </p>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        This team currently has no patients assigned. Patients will appear here once
                        they are admitted and assigned to this team.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {details.patients.map(patient => (
                      <Card
                        key={patient.id}
                        className="p-0 border border-border/50 shadow-sm hover:shadow-md hover:border-green-500/30 transition-all duration-200 group"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 min-w-0 flex-1">
                              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0 border border-green-500/20 mt-0.5 group-hover:bg-green-500/15 transition-colors">
                                <Users className="h-6 w-6 text-green-600 dark:text-green-500" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold text-foreground truncate mb-1">
                                  {patient.name}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {patient.dob
                                      ? new Date(patient.dob).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })
                                      : 'DOB Unknown'}
                                  </span>
                                  <span className="text-muted-foreground/50">•</span>
                                  <span className="capitalize">{patient.gender}</span>
                                </div>
                                <Badge variant="outline" className="text-xs font-medium">
                                  {patient.wardName || 'Ward Unknown'}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                                Admitted
                              </p>
                              <p className="text-sm font-semibold text-foreground">
                                {patient.admissionDate
                                  ? new Date(patient.admissionDate).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })
                                  : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : null}
      </DialogBody>
    </Dialog>
  )
}
