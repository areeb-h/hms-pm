'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LucideIcon, MoreHorizontal } from 'lucide-react'
import * as React from 'react'

export interface ActionItem {
  id: string
  label: string
  icon?: LucideIcon
  onClick?: () => void
  variant?: 'default' | 'destructive'
  separator?: boolean
}

interface ActionDropdownProps {
  actions: ActionItem[]
  label?: string
  align?: 'start' | 'center' | 'end'
}

export function ActionDropdown({ actions, label = 'Actions', align = 'end' }: ActionDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align}>
        <DropdownMenuLabel>{label}</DropdownMenuLabel>

        {actions.map(action => (
          <React.Fragment key={action.id}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={action.onClick}
              className={
                action.variant === 'destructive' ? 'text-destructive focus:text-destructive' : ''
              }
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
