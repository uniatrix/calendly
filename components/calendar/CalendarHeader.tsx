'use client'

import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { RoutineTemplates } from './RoutineTemplates'
import { ThemeSwitcher } from './ThemeSwitcher'
import type { CalendarView } from './CalendarShell'

interface CalendarHeaderProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  selectedDate: Date
  onDateChange: (date: Date) => void
  onNavigate: (direction: number) => void
  onNewEvent: () => void
}

export function CalendarHeader({
  view,
  onViewChange,
  selectedDate,
  onDateChange,
  onNavigate,
  onNewEvent,
}: CalendarHeaderProps) {
  const handleToday = () => {
    onDateChange(new Date())
  }

  const formatDateLabel = () => {
    if (view === 'month') {
      return selectedDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    } else if (view === 'week') {
      const startOfWeek = new Date(selectedDate)
      startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const startMonth = startOfWeek.toLocaleDateString('en-US', {
        month: 'short',
      })
      const endMonth = endOfWeek.toLocaleDateString('en-US', {
        month: 'short',
      })

      if (startMonth === endMonth) {
        return `${startMonth} ${startOfWeek.getDate()} - ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`
      }
      return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}, ${startOfWeek.getFullYear()}`
    } else {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs sm:text-sm">
          Today
        </Button>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onNavigate(-1)}
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => onNavigate(1)}
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h2 className="text-sm sm:text-lg font-semibold min-w-[120px] sm:min-w-[200px]">
            {formatDateLabel()}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => {
            if (value) onViewChange(value as CalendarView)
          }}
          className="hidden md:flex"
        >
          <ToggleGroupItem value="month" aria-label="Month view" className="text-xs sm:text-sm">
            Month
          </ToggleGroupItem>
          <ToggleGroupItem value="week" aria-label="Week view" className="text-xs sm:text-sm">
            Week
          </ToggleGroupItem>
          <ToggleGroupItem value="day" aria-label="Day view" className="text-xs sm:text-sm">
            Day
          </ToggleGroupItem>
        </ToggleGroup>
        <ThemeSwitcher />
        <RoutineTemplates onSelect={onNewEvent} />
        <Button size="sm" onClick={onNewEvent} className="text-xs sm:text-sm">
          <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">New Event</span>
          <span className="sm:hidden">New</span>
        </Button>
        <div className="ml-2">
          <UserButton />
        </div>
      </div>
    </header>
  )
}

