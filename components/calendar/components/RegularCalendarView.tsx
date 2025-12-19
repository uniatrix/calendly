'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '../CalendarShell'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns'

interface RegularCalendarViewProps {
  date: Date
  events: CalendarEvent[]
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
  onBackToMonths?: () => void
}

export function RegularCalendarView({
  date,
  events,
  onDateSelect,
  onMonthChange,
  onBackToMonths,
}: RegularCalendarViewProps) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePreviousMonth = () => {
    const newDate = new Date(date)
    newDate.setMonth(date.getMonth() - 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(date)
    newDate.setMonth(date.getMonth() + 1)
    onMonthChange(newDate)
  }

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

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {onBackToMonths && (
          <button
            onClick={onBackToMonths}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-bold text-foreground">
                {format(date, 'MMMM')}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {format(date, 'yyyy')}
              </span>
            </div>
          </button>
        )}
        {!onBackToMonths && (
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {format(date, 'MMMM')}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {format(date, 'yyyy')}
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const isCurrentMonth = isSameMonth(day, date)
          const isCurrentDay = isToday(day)
          const hasEvents = dayEvents.length > 0

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              className={`
                aspect-square p-2 rounded-md text-sm
                transition-colors
                ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/50'}
                ${isCurrentDay ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-accent'}
                ${hasEvents ? 'border-2 border-primary/50' : 'border border-transparent'}
                flex flex-col items-center justify-start gap-1
              `}
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && (
                <div className="flex gap-0.5 flex-wrap justify-center">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event._id}
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px]">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

