'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface ConfirmSubmitProps {
  formId: string
  buttonLabel?: string
  confirmTitle?: string
  confirmDescription?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  size?: 'sm' | 'lg' | 'default'
}

export default function ConfirmSubmit({
  formId,
  buttonLabel = 'Discharge',
  confirmTitle = 'Confirm Discharge',
  confirmDescription = 'Are you sure you want to discharge this patient? This action cannot be undone.',
  variant = 'destructive',
  size = 'sm',
}: ConfirmSubmitProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setSubmitting(true)
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (form) {
      // requestSubmit supports invoking the form action (server action)
      // as a proper submission
      form.requestSubmit()
    }
    setOpen(false)
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size={size} variant={variant} className="gap-2">
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{confirmTitle}</DialogTitle>
        </DialogHeader>

        <div className="pt-2 pb-4 text-sm text-muted-foreground">{confirmDescription}</div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" variant={variant} onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Working...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
