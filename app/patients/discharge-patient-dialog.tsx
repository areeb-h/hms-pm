'use client'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertTriangle, Loader2, UserMinus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface DischargePatientDialogProps {
  action?: (formData: FormData) => Promise<unknown>
  children?: React.ReactNode
  patientId?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function DischargePatientDialog({
  action,
  children,
  patientId,
  open: externalOpen,
  onOpenChange,
}: DischargePatientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  const [formData, setFormData] = useState({
    patientId: patientId ? patientId.toString() : '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!patientId) {
      if (!formData.patientId.trim()) {
        newErrors.patientId = 'Patient ID is required'
      } else if (isNaN(parseInt(formData.patientId)) || parseInt(formData.patientId) <= 0) {
        newErrors.patientId = 'Please enter a valid patient ID'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    startTransition(async () => {
      try {
        const formDataObj = new FormData()
        formDataObj.append('patientId', formData.patientId.trim())

        if (!action) throw new Error('No action provided to discharge patient')
        await action(formDataObj)

        toast.success('Patient discharged successfully', {
          description: `Patient ID ${formData.patientId} has been discharged from the hospital`,
          duration: 4000,
        })

        // Reset form
        setFormData({
          patientId: '',
        })
        setErrors({})
        setOpen(false)
      } catch (error) {
        toast.error('Discharge failed', {
          description: error instanceof Error ? error.message : 'Failed to discharge patient',
          duration: 5000,
        })
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && !isControlled && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
          <DialogDescription>
            Permanently discharge a patient from the hospital. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Warning:</strong> This will permanently remove the patient and all their
            treatment records from the system.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="discharge-patientId">
              Patient ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="discharge-patientId"
              type="number"
              value={formData.patientId}
              onChange={e => handleInputChange('patientId', e.target.value)}
              placeholder="Enter patient ID to discharge"
              disabled={!!patientId}
              className={errors.patientId ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.patientId && <p className="text-sm text-red-500">{errors.patientId}</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Discharging...
                </>
              ) : (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Discharge Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
