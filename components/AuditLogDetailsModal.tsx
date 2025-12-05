'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { Activity, Calendar, FileText, Hash, Info, Tag, User } from 'lucide-react'

interface AuditLogDetailsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  auditLog: {
    id: number
    action: string
    entityType: string
    entityId: string | number
    userName?: string | null
    userEmail?: string | null
    userRole?: string | null
    details: string | null
    timestamp: string
  }
}

export function AuditLogDetailsModal({ open, onOpenChange, auditLog }: AuditLogDetailsModalProps) {
  const parsedDetails = auditLog.details
    ? typeof auditLog.details === 'string'
      ? JSON.parse(auditLog.details)
      : auditLog.details
    : {}

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create')) return 'default'
    if (action.includes('admit')) return 'default'
    if (action.includes('discharge')) return 'secondary'
    if (action.includes('transfer')) return 'outline'
    if (action.includes('treatment')) return 'default'
    return 'outline'
  }

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'N/A'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value, null, 2)
    return String(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Basic Information */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4" />
              Basic Information
            </div>
            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Log ID
                </div>
                <div className="text-sm font-mono">{auditLog.id}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3 w-3" />
                  Action
                </div>
                <Badge variant={getActionBadgeColor(auditLog.action)}>
                  {auditLog.action.replace(/_/g, ' ').toUpperCase()}
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  Entity Type
                </div>
                <div className="text-sm capitalize">{auditLog.entityType}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Entity ID
                </div>
                <div className="text-sm font-mono">{auditLog.entityId}</div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  Timestamp
                </div>
                <div className="text-sm">
                  {format(new Date(auditLog.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                </div>
              </div>
            </div>
          </Card>

          {/* User Information */}
          {(auditLog.userName || auditLog.userEmail) && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                User Information
              </div>
              <Separator />

              <div className="grid grid-cols-2 gap-3">
                {auditLog.userName && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Name</div>
                    <div className="text-sm font-medium">{auditLog.userName}</div>
                  </div>
                )}

                {auditLog.userEmail && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="text-xs font-mono">{auditLog.userEmail}</div>
                  </div>
                )}

                {auditLog.userRole && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">Role</div>
                    <Badge variant={auditLog.userRole === 'superadmin' ? 'default' : 'secondary'}>
                      {auditLog.userRole}
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Additional Details */}
          {Object.keys(parsedDetails).length > 0 && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Additional Details
              </div>
              <Separator />

              <div className="space-y-2">
                {Object.entries(parsedDetails).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 gap-3 py-2 border-b last:border-0">
                    <div className="text-xs text-muted-foreground font-medium col-span-1">
                      {formatKey(key)}
                    </div>
                    <div className="text-xs col-span-2 font-mono break-all">
                      {renderValue(value)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
