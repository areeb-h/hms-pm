'use client'

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
  Dialog as UIDialog,
  DialogHeader as UIDialogHeader,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'
import { createContext, useContext } from 'react'

/* --------------------------------------------------------------------------------
 * Context
 * -------------------------------------------------------------------------------*/

type DialogContextProps = {
  icon?: LucideIcon
  iconColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
}

const DialogContext = createContext<DialogContextProps | null>(null)

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('Dialog components must be rendered within a Dialog component.')
  }
  return context
}

/* --------------------------------------------------------------------------------
 * Root
 * -------------------------------------------------------------------------------*/

type DialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  icon?: LucideIcon
  iconColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  className?: string
  maxWidth?: string
}

export function Dialog({
  open,
  onOpenChange,
  children,
  icon,
  iconColor = 'primary',
  className,
  maxWidth = '600px',
}: DialogProps) {
  return (
    <DialogContext.Provider value={{ icon, iconColor }}>
      <UIDialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'flex flex-col max-h-[90vh]',
            'p-0 gap-0 rounded-xl overflow-hidden',
            'bg-card/95 dark:bg-background/95 backdrop-blur-xl border border-border/40',
            'shadow-2xl shadow-black/10 dark:shadow-black/30',
            'transition-all duration-200',
            className
          )}
          style={{ maxWidth }}
        >
          {children}
        </DialogContent>
      </UIDialog>
    </DialogContext.Provider>
  )
}

/* --------------------------------------------------------------------------------
 * Header
 * -------------------------------------------------------------------------------*/

type DialogHeaderProps = {
  title?: string
  description?: string
  className?: string
  actions?: React.ReactNode
  hideIcon?: boolean
}

export function DialogHeader({
  title,
  description,
  className,
  actions,
  hideIcon = false,
}: DialogHeaderProps) {
  const context = useDialogContext()
  const Icon = context?.icon
  const iconColor = context?.iconColor || 'primary'

  const colorMap = {
    primary: {
      bg: 'bg-primary/8 dark:bg-primary/12',
      text: 'text-primary',
      border: 'border-primary/20 dark:border-primary/30',
      shadow: 'shadow-primary/10 dark:shadow-primary/20',
    },
    secondary: {
      bg: 'bg-secondary/8 dark:bg-secondary/12',
      text: 'text-secondary-foreground',
      border: 'border-secondary/20 dark:border-secondary/30',
      shadow: 'shadow-secondary/10 dark:shadow-secondary/20',
    },
    success: {
      bg: 'bg-green-500/8 dark:bg-green-500/12',
      text: 'text-green-600 dark:text-green-500',
      border: 'border-green-500/20 dark:border-green-500/30',
      shadow: 'shadow-green-500/10 dark:shadow-green-500/20',
    },
    danger: {
      bg: 'bg-red-500/8 dark:bg-red-500/12',
      text: 'text-red-600 dark:text-red-500',
      border: 'border-red-500/20 dark:border-red-500/30',
      shadow: 'shadow-red-500/10 dark:shadow-red-500/20',
    },
    warning: {
      bg: 'bg-yellow-500/8 dark:bg-yellow-500/12',
      text: 'text-yellow-600 dark:text-yellow-500',
      border: 'border-yellow-500/20 dark:border-yellow-500/30',
      shadow: 'shadow-yellow-500/10 dark:shadow-yellow-500/20',
    },
  }

  const palette = colorMap[iconColor]

  return (
    <UIDialogHeader
      className={cn(
        'flex flex-row items-start gap-4 flex-shrink-0',
        'bg-background/95 backdrop-blur-md border-b border-border/60',
        'shadow-sm px-6 py-5 transition-all duration-200',
        className
      )}
    >
      {Icon && !hideIcon && (
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-xl border p-3 mt-0.5',
            'bg-background/60 backdrop-blur-sm shadow-sm flex-shrink-0',
            'hover:shadow-md hover:scale-105 transition-all duration-200',
            palette.bg,
            palette.text,
            palette.border,
            palette.shadow
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <DialogTitle className="text-lg font-semibold leading-tight text-foreground">
          {title ?? 'Title'}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
            {description}
          </DialogDescription>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">{actions}</div>}
    </UIDialogHeader>
  )
}
DialogHeader.displayName = 'DialogHeader'

/* --------------------------------------------------------------------------------
 * Body
 * -------------------------------------------------------------------------------*/

type DialogBodyProps = React.ComponentProps<'div'> & {
  spaced?: boolean
  fullHeight?: boolean
  scrollable?: boolean
  noPadding?: boolean
}

export function DialogBody({
  className,
  spaced = false,
  fullHeight = false,
  scrollable = false,
  noPadding = false,
  children,
  ...props
}: DialogBodyProps) {
  const content = (
    <div
      {...props}
      className={cn(
        'w-full',
        !noPadding && 'px-6 py-6',
        spaced && 'space-y-8 md:space-y-10',
        fullHeight && 'flex flex-col',
        className
      )}
    >
      {children}
    </div>
  )

  if (scrollable) {
    return <ScrollArea className="flex-1 min-h-0 w-full [&>div>div]:!block">{content}</ScrollArea>
  }

  // For non-scrollable content (like forms), just return content without forcing flex-1
  return content
}
DialogBody.displayName = 'DialogBody'

/* --------------------------------------------------------------------------------
 * Footer
 * -------------------------------------------------------------------------------*/

type DialogFooterProps = React.ComponentProps<'div'> & {
  sticky?: boolean
  variant?: 'default' | 'form' | 'split'
}

export function DialogFooter({
  className,
  sticky = true,
  variant = 'default',
  children,
  ...props
}: DialogFooterProps) {
  return (
    <div
      className={cn(
        sticky && 'mt-auto',
        'flex items-center flex-shrink-0',
        'bg-background/95 backdrop-blur-md border-t border-border/60',
        'shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.20)]',
        'px-6 py-4 transition-all duration-200',
        variant === 'default' && 'gap-3 justify-end',
        variant === 'form' && 'gap-3 justify-between',
        variant === 'split' && 'justify-between gap-3',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
DialogFooter.displayName = 'DialogFooter'

/* --------------------------------------------------------------------------------
 * Divider
 * -------------------------------------------------------------------------------*/

export function DialogDivider({ className, ...props }: React.ComponentProps<'hr'>) {
  return (
    <hr
      className={cn('border-0 border-t border-border/40 my-6 -mx-6 w-[calc(100%+3rem)]', className)}
      {...props}
    />
  )
}
DialogDivider.displayName = 'DialogDivider'

/* --------------------------------------------------------------------------------
 * Section
 * -------------------------------------------------------------------------------*/

type DialogSectionProps = React.ComponentProps<'div'> & {
  title?: string
  description?: string
}

export function DialogSection({
  className,
  title,
  description,
  children,
  ...props
}: DialogSectionProps) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {(title || description) && (
        <div className="space-y-1.5">
          {title && (
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
DialogSection.displayName = 'DialogSection'
