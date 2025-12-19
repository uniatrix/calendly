'use client'

import { useMemo, useEffect, useState } from 'react'
import { EventCard } from '../EventCard'
import type { CalendarEvent } from '../CalendarShell'

interface DayViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function DayView({
  selectedDate,
  events,
  onEventClick,
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  const getAllDayEvents = (): CalendarEvent[] => {
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return (
        eventStart >= dayStart &&
        eventStart <= dayEnd &&
        event.allDay
      )
    })
  }

  const getTimedEvents = (): CalendarEvent[] => {
    const dayStart = new Date(selectedDate)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(selectedDate)
    dayEnd.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return (
        eventStart >= dayStart &&
        eventStart <= dayEnd &&
        !event.allDay
      )
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

  const getCurrentTimePosition = () => {
    if (
      currentTime.getDate() !== selectedDate.getDate() ||
      currentTime.getMonth() !== selectedDate.getMonth() ||
      currentTime.getFullYear() !== selectedDate.getFullYear()
    ) {
      return null
    }

    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes()
    return (minutes / (24 * 60)) * 100
  }

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    )
  }, [selectedDate])

  const allDayEvents = getAllDayEvents()
  const timedEvents = getTimedEvents()
  const currentTimePercent = getCurrentTimePosition()

  return (
    <div className="flex h-full flex-col overflow-auto">
      {/* All-day section */}
      {allDayEvents.length > 0 && (
        <div className="border-b border-border p-2 sm:p-4">
          <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
            All day
          </div>
          <div className="space-y-1">
            {allDayEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                variant="day"
                onEdit={onEventClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2">
          {/* Time column */}
          <div className="border-r border-border">
            {hours.map((hour) => (
              <div
                key={hour}
                className="border-b border-border p-2 sm:p-4 text-[10px] sm:text-xs text-muted-foreground"
                style={{ height: '120px' }}
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
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

            {/* Current time indicator */}
            {isToday && currentTimePercent !== null && (
              <div
                className="absolute left-0 right-0 z-10"
                style={{ top: `${currentTimePercent}%` }}
              >
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-0.5 flex-1 bg-red-500" />
                </div>
              </div>
            )}

            {/* Events */}
            <div className="absolute inset-0 px-2">
              {timedEvents.map((event) => {
                const position = getEventPosition(event)
                return (
                  <div
                    key={event._id}
                    className="absolute left-2 right-2"
                    style={{
                      top: position.top,
                      height: position.height,
                    }}
                  >
                    <EventCard
                      event={event}
                      variant="day"
                      onEdit={onEventClick}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

