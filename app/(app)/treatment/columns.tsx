'use client'

import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

interface TreatmentRow {
  id: number
  patientName: string
  doctorName: string
  doctorGrade: string
  teamName: string | null
  wardName: string | null
  description: string
  notes: string | null
  treatmentDate: string
  createdAt: string
}

export function columns(): ColumnDef<TreatmentRow>[] {
  return [
    {
      accessorKey: 'patientName',
      header: 'Patient',
      cell: ({ row }) => <div className="font-medium">{row.original.patientName}</div>,
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor',
    },
    {
      accessorKey: 'doctorGrade',
      header: 'Grade',
      cell: ({ row }) => {
        const grade = row.original.doctorGrade
        const variant =
          grade === 'consultant' ? 'default' : grade === 'junior1' ? 'secondary' : 'outline'
        return <Badge variant={variant}>{grade}</Badge>
      },
    },
    {
      accessorKey: 'teamName',
      header: 'Team',
      cell: ({ row }) => row.original.teamName || '-',
    },
    {
      accessorKey: 'wardName',
      header: 'Ward',
      cell: ({ row }) => row.original.wardName || '-',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="max-w-[300px] truncate cursor-help">{row.original.description}</div>
            </TooltipTrigger>
            <TooltipContent className="max-w-md">
              <p>{row.original.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notes',
      cell: ({ row }) => {
        const notes = row.original.notes
        return notes ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] truncate text-sm text-muted-foreground cursor-help">
                  {notes}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p>{notes}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      accessorKey: 'treatmentDate',
      header: 'Treatment Date',
      cell: ({ row }) => {
        const date = row.original.treatmentDate
        try {
          return format(new Date(date), 'MMM dd, yyyy HH:mm')
        } catch {
          return date
        }
      },
    },
  ]
}
