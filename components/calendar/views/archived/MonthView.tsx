'use client'

import { useMemo } from 'react'
import { EventCard } from '../EventCard'
import type { CalendarEvent } from '../CalendarShell'

interface MonthViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}

export function MonthView({
  selectedDate,
  events,
  onEventClick,
  onDateClick,
}: MonthViewProps) {
  const { weeks, monthName, year } = useMemo(() => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Get first day of week (Sunday = 0)
    const startDay = firstDay.getDay()

    // Get total days in month
    const daysInMonth = lastDay.getDate()

    // Create array of weeks
    const weeks: Date[][] = []
    let currentWeek: Date[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startDay; i++) {
      const date = new Date(year, month, 1 - startDay + i)
      currentWeek.push(date)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      currentWeek.push(date)

      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Add remaining days from next month
    if (currentWeek.length > 0) {
      const remainingDays = 7 - currentWeek.length
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(year, month + 1, day)
        currentWeek.push(date)
      }
      weeks.push(currentWeek)
    }

    return {
      weeks,
      monthName: selectedDate.toLocaleDateString('en-US', { month: 'long' }),
      year,
    }
  }, [selectedDate])

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= dateStart && eventStart <= dateEnd
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === selectedDate.getMonth()
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="grid grid-cols-7 border-b border-border">
        {dayNames.map((day) => (
          <div
            key={day}
            className="border-r border-border p-1 sm:p-2 text-center text-[10px] sm:text-xs font-medium uppercase tracking-wide text-muted-foreground last:border-r-0"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day[0]}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-rows-6 grid-cols-7">
        {weeks.map((week, weekIndex) =>
          week.map((date, dayIndex) => {
            const dateEvents = getEventsForDate(date)
            const maxVisible = 3
            const visibleEvents = dateEvents.slice(0, maxVisible)
            const moreCount = dateEvents.length - maxVisible

            return (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`
                  min-h-[80px] sm:min-h-[120px] border-r border-b border-border p-1 sm:p-2 transition-colors
                  ${isCurrentMonth(date) ? 'bg-background' : 'bg-muted/30'}
                  ${isToday(date) ? 'bg-accent/20' : ''}
                  hover:bg-muted/50 cursor-pointer
                `}
                onClick={() => onDateClick(date)}
              >
                <div
                  className={`
                    mb-0.5 sm:mb-1 text-xs sm:text-sm font-medium
                    ${isToday(date) ? 'text-primary' : 'text-foreground'}
                    ${!isCurrentMonth(date) ? 'text-muted-foreground' : ''}
                  `}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {visibleEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      variant="month"
                      onEdit={onEventClick}
                    />
                  ))}
                  {moreCount > 0 && (
                    <div className="text-[10px] text-muted-foreground px-2 py-0.5">
                      +{moreCount} more
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

