'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface CreateWardDialogProps {
  action?: (formData: FormData) => Promise<unknown>
}

export function CreateWardDialog({ action }: CreateWardDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" className="gap-2">
          Create Ward
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Ward</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async e => {
            e.preventDefault()
            if (!action) return
            const fd = new FormData(e.currentTarget as HTMLFormElement)
            await action(fd)
            setOpen(false)
            window.location.reload()
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="name">Name</label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <label htmlFor="genderType">Gender Type</label>
            <select id="genderType" name="genderType" className="border rounded p-2 w-full">
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label htmlFor="capacity">Capacity</label>
            <Input id="capacity" name="capacity" type="number" required />
          </div>
          <Button type="submit">Create Ward</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
