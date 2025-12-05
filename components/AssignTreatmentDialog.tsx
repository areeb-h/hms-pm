'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface AssignTreatmentDialogProps {
  patients: { id: number; name: string; wardName: string | null; teamName: string | null }[]
  doctors: { id: number; name: string; grade: string; teamName: string | null }[]
  action: (formData: FormData) => Promise<{ success: boolean; message: string }>
  children?: React.ReactNode
}

export function AssignTreatmentDialog({
  patients,
  doctors,
  action,
  children,
}: AssignTreatmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedDoctor, setSelectedDoctor] = useState<string>('')
  const [isPending, startTransition] = useTransition()

  // Filter doctors based on selected patient's team
  const filteredDoctors = selectedPatient
    ? (() => {
        const patient = patients.find(p => p.id.toString() === selectedPatient)
        if (!patient) return doctors
        return doctors.filter(d => d.teamName === patient.teamName)
      })()
    : doctors

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSelectedPatient('')
      setSelectedDoctor('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedPatient || !selectedDoctor) {
      toast.error('Please select both patient and doctor')
      return
    }

    startTransition(async () => {
      const formData = new FormData(e.currentTarget)
      const result = await action(formData)

      if (result.success) {
        toast.success(result.message || 'Treatment recorded successfully')
        setOpen(false)
        setSelectedPatient('')
        setSelectedDoctor('')
      } else {
        toast.error(result.message || 'Failed to record treatment')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children || <Button>Assign Treatment</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Assign Treatment</DialogTitle>
            <DialogDescription>
              Record that a doctor has treated a patient. The doctor must be on the same team as the
              patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient *</Label>
              <Select
                name="patientId"
                value={selectedPatient}
                onValueChange={setSelectedPatient}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} - {p.wardName || 'No Ward'} (Team: {p.teamName || 'None'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="doctorId">Doctor *</Label>
              <Select
                name="doctorId"
                value={selectedDoctor}
                onValueChange={setSelectedDoctor}
                required
                disabled={!selectedPatient}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      selectedPatient ? 'Select a doctor from the team' : 'Select a patient first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map(d => (
                    <SelectItem key={d.id} value={d.id.toString()}>
                      {d.name} - {d.grade} ({d.teamName || 'No Team'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPatient && filteredDoctors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No doctors available in the patient&apos;s team
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Treatment Description *</Label>
              <Input
                id="description"
                name="description"
                placeholder="e.g., Blood pressure check, X-ray review..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatmentNotes">Treatment Notes (Optional)</Label>
              <Input
                id="treatmentNotes"
                name="treatmentNotes"
                placeholder="Add any notes about the treatment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Record Treatment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
