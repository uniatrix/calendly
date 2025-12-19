'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { RoutineTemplates } from './RoutineTemplates'
import { ThemeSwitcher } from './ThemeSwitcher'

interface CalendarHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onNewEvent: () => void
}

export function CalendarHeader({
  selectedDate,
  onDateChange,
  onNewEvent,
}: CalendarHeaderProps) {

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button size="sm" onClick={onNewEvent} className="text-xs sm:text-sm">
          <Plus className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">New Event</span>
          <span className="sm:hidden">New</span>
        </Button>
        <RoutineTemplates onSelect={onNewEvent} />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeSwitcher />
        <div className="ml-2">
          <UserButton />
        </div>
      </div>
    </header>
  )
}

