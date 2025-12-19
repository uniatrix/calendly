'use client'

import { useMemo } from 'react'
import { EventCard } from '../EventCard'
import type { CalendarEvent } from '../CalendarShell'

interface WeekViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function WeekView({
  selectedDate,
  events,
  onEventClick,
}: WeekViewProps) {
  const { weekDays, startOfWeek } = useMemo(() => {
    const start = new Date(selectedDate)
    start.setDate(selectedDate.getDate() - selectedDate.getDay())
    start.setHours(0, 0, 0, 0)

    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }

    return { weekDays: days, startOfWeek: start }
  }, [selectedDate])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= dayStart && eventStart <= dayEnd
    })
  }

  const getEventPosition = (event: CalendarEvent) => {
    const start = new Date(event.startTime)
    const end = new Date(event.endTime)

    const startMinutes = start.getHours() * 60 + start.getMinutes()
    const endMinutes = end.getHours() * 60 + end.getMinutes()
    const duration = endMinutes - startMinutes

    const topPercent = (startMinutes / (24 * 60)) * 100
    const heightPercent = (duration / (24 * 60)) * 100

    return {
      top: `${topPercent}%`,
      height: `${Math.max(heightPercent, 2)}%`,
    }
  }

  const getAllDayEvents = (day: Date): CalendarEvent[] => {
    return getEventsForDay(day).filter((event) => event.allDay)
  }

  const getTimedEvents = (day: Date): CalendarEvent[] => {
    return getEventsForDay(day).filter((event) => !event.allDay)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* All-day section */}
      <div className="border-b border-border">
        <div className="grid grid-cols-8">
          <div className="border-r border-border p-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className="hidden sm:inline">All day</span>
            <span className="sm:hidden">All</span>
          </div>
          {weekDays.map((day) => {
            const allDayEvents = getAllDayEvents(day)
            return (
              <div
                key={day.toISOString()}
                className={`
                  border-r border-border p-2 last:border-r-0
                  ${isToday(day) ? 'bg-accent/20' : ''}
                `}
              >
                <div className="space-y-1">
                  {allDayEvents.map((event) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      variant="week"
                      onEdit={onEventClick}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8">
          {/* Time column */}
          <div className="border-r border-border">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border p-1 sm:p-2 text-[10px] sm:text-xs text-muted-foreground"
                style={{ height: '120px' }}
              >
                <span className="hidden sm:inline">{hour.toString().padStart(2, '0')}:00</span>
                <span className="sm:hidden">{hour}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day) => {
            const timedEvents = getTimedEvents(day)
            return (
              <div
                key={day.toISOString()}
                className={`
                  relative border-r border-border last:border-r-0
                  ${isToday(day) ? 'bg-accent/10' : ''}
                `}
              >
                {/* Hour grid lines */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border"
                    style={{ height: '120px' }}
                  >
                    {/* Half-hour line */}
                    <div className="h-[60px] border-b border-dashed border-muted" />
                  </div>
                ))}

                {/* Events */}
                <div className="absolute inset-0">
                  {timedEvents.map((event) => {
                    const position = getEventPosition(event)
                    return (
                      <div
                        key={event._id}
                        className="absolute left-1 right-1"
                        style={{
                          top: position.top,
                          height: position.height,
                        }}
                      >
                        <EventCard
                          event={event}
                          variant="week"
                          onEdit={onEventClick}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

