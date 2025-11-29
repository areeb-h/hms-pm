'use client'

import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/custom-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { AlertCircle, UserPlus } from 'lucide-react'
import { useState } from 'react'

interface Team {
  id: number
  name: string
}

interface CreateDoctorDialogProps {
  teams: Team[]
  action?: (formData: FormData) => Promise<unknown>
}

export function CreateDoctorDialog({ teams, action }: CreateDoctorDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedGrade, setSelectedGrade] = useState<string>('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset form state when closing
      setSelectedGrade('')
      setFormErrors({})
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        Add Doctor
      </Button>

      <Dialog
        open={open}
        onOpenChange={handleOpenChange}
        icon={UserPlus}
        iconColor="primary"
        maxWidth="550px"
      >
        <DialogHeader
          title="Add New Doctor"
          description="Create a doctor profile and assign them to a team"
        />

        <form
          onSubmit={async e => {
            e.preventDefault()
            if (isSubmitting) return

            // Client-side validation
            setFormErrors({})
            const form = e.currentTarget as HTMLFormElement
            const fd = new FormData(form)
            const grade = (fd.get('grade') as string) || ''
            const teamId = (fd.get('teamId') as string) || ''

            if (grade === 'consultant' && (!teamId || teamId === '')) {
              setFormErrors({ teamId: 'Consultants must be assigned to a team' })
              return
            }

            setIsSubmitting(true)
            try {
              await action?.(fd)
              setOpen(false)
              form.reset()
              setSelectedGrade('')
            } catch (error) {
              console.error('Failed to create doctor:', error)
              setFormErrors({ submit: 'Failed to create doctor. Please try again.' })
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <DialogBody className="space-y-5">
            {formErrors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formErrors.submit}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Dr. Ahmed Hassan"
                required
                disabled={isSubmitting}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">Enter the doctor's complete name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade" className="text-sm font-medium">
                Grade / Position <span className="text-red-500">*</span>
              </Label>
              <Select
                name="grade"
                required
                disabled={isSubmitting}
                value={selectedGrade}
                onValueChange={setSelectedGrade}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consultant">Consultant</SelectItem>
                  <SelectItem value="junior1">Junior 1</SelectItem>
                  <SelectItem value="junior2">Junior 2</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The doctor's current grade or position level
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamId" className="text-sm font-medium">
                Team Assignment
                {selectedGrade === 'consultant' && <span className="text-red-500 ml-1">*</span>}
              </Label>
              <Select name="teamId" disabled={isSubmitting}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select team (optional for non-consultants)" />
                </SelectTrigger>
                <SelectContent>
                  {teams.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No teams available
                    </div>
                  ) : (
                    teams.map(team => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {formErrors.teamId ? (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.teamId}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {selectedGrade === 'consultant'
                    ? 'Consultants must be assigned to a team'
                    : 'Optional - can be assigned later'}
                </p>
              )}
            </div>

            {selectedGrade === 'consultant' && teams.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No teams available. Please create a team first before adding consultants.
                </AlertDescription>
              </Alert>
            )}
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || (selectedGrade === 'consultant' && teams.length === 0)}
            >
              {isSubmitting ? 'Adding...' : 'Add Doctor'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  )
}
