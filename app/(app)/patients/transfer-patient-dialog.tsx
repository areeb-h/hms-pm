'use client'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRightLeft, Loader2 } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface Ward {
  id: number
  name: string
  genderType: string
  capacity: number
}

interface TransferPatientDialogProps {
  wards: Ward[]
  /** server action passed from the page */
  action?: (formData: FormData) => Promise<unknown>
  children?: React.ReactNode
  patientId?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function TransferPatientDialog({
  wards,
  action,
  children,
  patientId,
  open: externalOpen,
  onOpenChange,
}: TransferPatientDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? onOpenChange || (() => {}) : setInternalOpen

  const [formData, setFormData] = useState({
    patientId: patientId ? patientId.toString() : '',
    newWardId: '',
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

    if (!formData.newWardId) {
      newErrors.newWardId = 'Destination ward is required'
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
        formDataObj.append('newWardId', formData.newWardId)

        if (!action) throw new Error('No action provided to transfer patient')
        await action(formDataObj)

        const selectedWard = wards.find(w => w.id.toString() === formData.newWardId)
        toast.success('Patient transferred successfully', {
          description: `Patient ID ${formData.patientId} has been transferred to ${
            selectedWard?.name || 'the selected ward'
          }`,
          duration: 4000,
        })

        // Reset form
        setFormData({
          patientId: patientId ? patientId.toString() : '',
          newWardId: '',
        })
        setErrors({})
        setOpen(false)
      } catch (error) {
        toast.error('Transfer failed', {
          description: error instanceof Error ? error.message : 'Failed to transfer patient',
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
          <DialogTitle>Transfer Patient</DialogTitle>
          <DialogDescription>
            Transfer a patient from their current ward to a different ward.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-patientId">
              Patient ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="transfer-patientId"
              type="number"
              value={formData.patientId}
              onChange={e => handleInputChange('patientId', e.target.value)}
              placeholder="Enter patient ID"
              disabled={!!patientId}
              className={errors.patientId ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.patientId && <p className="text-sm text-red-500">{errors.patientId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-wardId">
              Transfer to Ward <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.newWardId}
              onValueChange={value => handleInputChange('newWardId', value)}
            >
              <SelectTrigger
                className={errors.newWardId ? 'border-red-500 focus:ring-red-500' : ''}
              >
                <SelectValue placeholder="Select destination ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{ward.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {ward.genderType} ward • {ward.capacity} beds
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.newWardId && <p className="text-sm text-red-500">{errors.newWardId}</p>}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transferring...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="mr-2 h-4 w-4" />
                  Transfer Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
