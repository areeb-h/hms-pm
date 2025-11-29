'use client'

import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/components/custom-dialog'
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
import { Users } from 'lucide-react'
import { useState } from 'react'

interface Consultant {
  id: number
  name: string
}

interface CreateTeamDialogProps {
  consultants: Consultant[]
  /** server action passed from a server component */
  action?: (formData: FormData) => Promise<unknown>
}

export function CreateTeamDialog({ consultants, action }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Create Team
      </Button>

      <Dialog open={open} onOpenChange={setOpen} icon={Users} iconColor="primary" maxWidth="550px">
        <DialogHeader
          title="Create New Team"
          description="Add a new medical team and assign a consultant"
        />

        <form
          onSubmit={async e => {
            e.preventDefault()
            if (!action || isSubmitting) return

            setIsSubmitting(true)
            try {
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              await action(fd)
              setOpen(false)
              e.currentTarget.reset()
            } catch (error) {
              console.error('Failed to create team:', error)
            } finally {
              setIsSubmitting(false)
            }
          }}
        >
          <DialogBody className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-sm font-medium">
                Team Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                name="code"
                placeholder="e.g., MED-001, SURG-A"
                required
                disabled={isSubmitting}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">A unique identifier for this team</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Team Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Cardiology Team A"
                required
                disabled={isSubmitting}
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">The display name for this team</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultantId" className="text-sm font-medium">
                Consultant <span className="text-red-500">*</span>
              </Label>
              <Select name="consultantId" required disabled={isSubmitting}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select a consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No consultants available
                    </div>
                  ) : (
                    consultants.map(consultant => (
                      <SelectItem key={consultant.id} value={consultant.id.toString()}>
                        {consultant.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Assign a consultant to lead this team</p>
            </div>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || consultants.length === 0}>
              {isSubmitting ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  )
}
