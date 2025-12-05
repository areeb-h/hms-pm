'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PatientRow } from '@/types/patients'
import { Calendar, Hospital, Stethoscope, User, Users } from 'lucide-react'

interface PatientDetailsDialogProps {
  patient: PatientRow | null
  treatments: {
    id: number
    doctorName: string
    doctorGrade: string
    teamName: string | null
    createdAt: string
  }[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function PatientDetailsDialog({
  patient,
  treatments,
  open,
  onOpenChange,
}: PatientDetailsDialogProps) {
  if (!patient) return null

  const age = calculateAge(patient.dob)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Patient Details</DialogTitle>
          <DialogDescription>
            Comprehensive patient information and treatment history
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                      <p className="text-lg font-semibold">{patient.name}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age / Gender</p>
                      <p className="text-lg font-semibold">
                        {age} years / <Badge variant="outline">{patient.gender}</Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Hospital className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ward</p>
                      <p className="text-lg font-semibold">{patient.wardName || 'Not Assigned'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Team</p>
                      <p className="text-lg font-semibold">{patient.teamName || 'Not Assigned'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Admission Details</p>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="font-medium">
                          {patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Admission Date</p>
                        <p className="font-medium">
                          {patient.admissionDate
                            ? new Date(patient.admissionDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Treatment History */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Treatment History</h3>
              <Badge variant="secondary">{treatments.length} records</Badge>
            </div>

            {treatments.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    No treatment records found for this patient
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Date & Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {treatments.map(t => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.doctorName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              t.doctorGrade === 'consultant'
                                ? 'default'
                                : t.doctorGrade === 'junior1'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {t.doctorGrade}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.teamName || '-'}</TableCell>
                        <TableCell>
                          {t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
