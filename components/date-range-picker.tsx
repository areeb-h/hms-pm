// ============================================================================
// components/ui/date-range-picker.tsx
// Enhanced Date Range Picker with External Control & Custom Icon Support
// ============================================================================
'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { addDays, format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { parseAsString, useQueryStates } from 'nuqs'
import * as React from 'react'
import { DateRange } from 'react-day-picker'

interface DateRangePickerProps {
  /** URL param names (default: ["startDate", "endDate"]) */
  paramNames?: [string, string]
  /** Optional custom icon (defaults to CalendarIcon) */
  icon?: React.ReactNode
  /** Optional callback when cleared */
  onClear?: () => void
  /** Optional className for button */
  className?: string
}

/**
 * A reusable date range picker that syncs with URL params using nuqs.
 */
export function DateRangePicker({
  paramNames = ['startDate', 'endDate'],
  icon,
  onClear,
  className,
}: DateRangePickerProps) {
  const [urlState, setUrlState] = useQueryStates(
    {
      [paramNames[0]]: parseAsString,
      [paramNames[1]]: parseAsString,
    },
    {
      history: 'replace',
      shallow: false,
      throttleMs: 300,
    }
  )

  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (urlState[paramNames[0]] && urlState[paramNames[1]]) {
      return {
        from: new Date(urlState[paramNames[0]]!),
        to: new Date(urlState[paramNames[1]]!),
      }
    }
    return undefined
  })

  // 🧹 Reset local state if external URL is cleared
  React.useEffect(() => {
    if (!urlState[paramNames[0]] && !urlState[paramNames[1]]) {
      setDate(undefined)
    }
  }, [urlState[paramNames[0]], urlState[paramNames[1]]])

  // 📅 Handle date selection
  const handleSelect = (range: DateRange | undefined) => {
    setDate(range)
    if (range?.from && range?.to) {
      setUrlState({
        [paramNames[0]]: format(range.from, 'yyyy-MM-dd'),
        [paramNames[1]]: format(range.to, 'yyyy-MM-dd'),
      })
    } else {
      setUrlState({
        [paramNames[0]]: null,
        [paramNames[1]]: null,
      })
    }
  }

  // 🧽 Handle manual clear
  const handleClear = () => {
    setDate(undefined)
    setUrlState({
      [paramNames[0]]: null,
      [paramNames[1]]: null,
    })
    onClear?.()
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`h-8 text-sm font-normal ${className ?? ''}`}
        >
          {/* Custom or default icon */}
          <span className="mr-2 flex items-center">
            {icon ?? <CalendarIcon className="h-4 w-4" />}
          </span>

          {/* Date display */}
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, 'MMM d')} – {format(date.to, 'MMM d, yyyy')}
              </>
            ) : (
              format(date.from, 'MMM d, yyyy')
            )
          ) : (
            <span>Date range</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-0">
        <Calendar
          mode="range"
          selected={date}
          onSelect={handleSelect}
          numberOfMonths={2}
          defaultMonth={date?.from || new Date()}
          disabled={d => d > addDays(new Date(), 0)}
        />

        {/* Clear Button */}
        {date && (
          <div className="flex justify-end p-2 border-t">
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
