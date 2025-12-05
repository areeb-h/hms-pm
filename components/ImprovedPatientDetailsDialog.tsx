'use client'

import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/custom-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PatientRow } from '@/types/patients'
import { Loader2, Plus, Stethoscope, UserCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface PatientDetailsDialogProps {
  patient: PatientRow | null
  treatments: {
    id: number
    doctorName: string
    doctorGrade: string
    teamName: string | null
    description: string
    notes: string | null
    treatmentDate: string
    createdAt: string
  }[]
  doctors: {
    id: number
    name: string
    grade: string
    teamName: string | null
  }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onTreatmentAdded?: () => void
  recordTreatmentAction: (formData: FormData) => Promise<{ success: boolean; message: string }>
}

const calculateAge = (dob: string | null | undefined) => {
  if (!dob) return 'N/A'
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return `${age} years`
}

export function ImprovedPatientDetailsDialog({
  patient,
  treatments,
  doctors,
  open,
  onOpenChange,
  onTreatmentAdded,
  recordTreatmentAction,
}: PatientDetailsDialogProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [treatmentDescription, setTreatmentDescription] = useState('')
  const [treatmentNotes, setTreatmentNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddTreatment, setShowAddTreatment] = useState(false)

  if (!patient) return null

  // Filter doctors by patient's team
  const eligibleDoctors = doctors.filter(d => d.teamName === patient.teamName)

  const handleAddTreatment = async () => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor')
      return
    }

    if (!treatmentDescription.trim()) {
      toast.error('Please enter a treatment description')
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('patientId', patient.id.toString())
    formData.append('doctorId', selectedDoctor)
    formData.append('description', treatmentDescription)
    formData.append('treatmentNotes', treatmentNotes)

    try {
      const result = await recordTreatmentAction(formData)
      if (result.success) {
        toast.success('Treatment recorded successfully')
        setSelectedDoctor('')
        setTreatmentDescription('')
        setTreatmentNotes('')
        setShowAddTreatment(false)
        onTreatmentAdded?.()
      } else {
        toast.error(result.message || 'Failed to record treatment')
      }
    } catch {
      toast.error('An error occurred while recording treatment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      icon={UserCircle}
      iconColor="primary"
      maxWidth="800px"
    >
      <DialogHeader
        title={patient.name}
        description={`Patient ID: ${patient.id} • ${calculateAge(patient.dob)} • ${patient.gender}`}
      />

      <DialogBody>
        <div className="space-y-6">
          {/* Patient Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-sm font-medium">
                {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'Not recorded'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Admission Date</p>
              <p className="text-sm font-medium">
                {patient.admissionDate
                  ? new Date(patient.admissionDate).toLocaleDateString()
                  : 'Not recorded'}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Ward</p>
              <p className="text-sm font-medium">{patient.wardName || 'Not Assigned'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Team</p>
              <p className="text-sm font-medium">{patient.teamName || 'Not Assigned'}</p>
            </div>
          </div>

          <Separator />

          {/* Treatment History Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Treatment History</h3>
                <Badge variant="secondary">{treatments.length}</Badge>
              </div>
              {!showAddTreatment && eligibleDoctors.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddTreatment(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Treatment
                </Button>
              )}
            </div>

            {/* Add Treatment Form */}
            {showAddTreatment && (
              <div className="mb-4 p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Treating Doctor *</Label>
                    <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select doctor from team" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleDoctors.map(d => (
                          <SelectItem key={d.id} value={d.id.toString()}>
                            {d.name} - {d.grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Treatment Description *</Label>
                    <Input
                      id="description"
                      placeholder="e.g., Blood pressure check, X-ray review..."
                      value={treatmentDescription}
                      onChange={e => setTreatmentDescription(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Treatment Notes (Optional)</Label>
                    <Input
                      id="notes"
                      placeholder="Add notes about the treatment..."
                      value={treatmentNotes}
                      onChange={e => setTreatmentNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowAddTreatment(false)
                      setSelectedDoctor('')
                      setTreatmentDescription('')
                      setTreatmentNotes('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleAddTreatment} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Record Treatment
                  </Button>
                </div>
              </div>
            )}

            {/* Treatments Table */}
            {treatments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No treatment records yet</p>
              </div>
            ) : (
              <TooltipProvider>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Doctor</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead>Treatment Date</TableHead>
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
                          <TableCell className="max-w-[200px]">
                            {t.description ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate cursor-help">{t.description}</div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <p>{t.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="max-w-[150px] text-sm text-muted-foreground">
                            {t.notes ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="truncate cursor-help">{t.notes}</div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <p>{t.notes}</p>
                                </TooltipContent>
                              </Tooltip>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {t.treatmentDate ? new Date(t.treatmentDate).toLocaleString() : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
