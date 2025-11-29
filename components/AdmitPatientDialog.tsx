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
import { Loader2, UserPlus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

interface Ward {
  id: number
  name: string
}

interface Team {
  id: number
  name: string
}

interface AdmitPatientDialogProps {
  wards: Ward[]
  teams: Team[]
  /** server action from the page */
  action?: (formData: FormData) => Promise<unknown>
  children?: React.ReactNode
}

export function AdmitPatientDialog({ wards, teams, action, children }: AdmitPatientDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    wardId: '',
    teamId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required'
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required'
    }

    if (!formData.wardId) {
      newErrors.wardId = 'Ward selection is required'
    }

    if (!formData.teamId) {
      newErrors.teamId = 'Team selection is required'
    }

    // Optional: add dob validation if needed

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
        formDataObj.append('name', formData.name.trim())
        if (formData.dob) formDataObj.append('dob', formData.dob)
        formDataObj.append('gender', formData.gender)
        formDataObj.append('wardId', formData.wardId)
        formDataObj.append('teamId', formData.teamId)

        if (!action) throw new Error('No action provided to admit patient')
        await action(formDataObj)

        toast.success('Patient admitted successfully', {
          description: `${formData.name} has been admitted to the hospital`,
          duration: 4000,
        })

        // Reset form
        setFormData({
          name: '',
          dob: '',
          gender: '',
          wardId: '',
          teamId: '',
        })
        setErrors({})
        setOpen(false)
      } catch (error) {
        toast.error('Failed to admit patient', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
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
      <DialogTrigger asChild>
        {children || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Admit Patient
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admit New Patient</DialogTitle>
          <DialogDescription>
            Enter patient details to admit them to the hospital.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Patient Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
              placeholder="Enter patient's full name"
              className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              value={formData.dob}
              onChange={e => handleInputChange('dob', e.target.value)}
              placeholder="Enter date of birth (optional)"
              className={errors.dob ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.dob && <p className="text-sm text-red-500">{errors.dob}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">
              Gender <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={value => handleInputChange('gender', value)}
            >
              <SelectTrigger className={errors.gender ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">
              Ward <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.wardId}
              onValueChange={value => handleInputChange('wardId', value)}
            >
              <SelectTrigger className={errors.wardId ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map(ward => (
                  <SelectItem key={ward.id} value={ward.id.toString()}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.wardId && <p className="text-sm text-red-500">{errors.wardId}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="team">
              Medical Team <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.teamId}
              onValueChange={value => handleInputChange('teamId', value)}
            >
              <SelectTrigger className={errors.teamId ? 'border-red-500 focus:ring-red-500' : ''}>
                <SelectValue placeholder="Select medical team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.teamId && <p className="text-sm text-red-500">{errors.teamId}</p>}
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
                  Admitting...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Admit Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
