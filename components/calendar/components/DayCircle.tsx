'use client'

import { EventDot } from './EventDot'
import type { CalendarEvent } from '../CalendarShell'

interface DayCircleProps {
  date: Date
  isToday: boolean
  isPast: boolean
  events: CalendarEvent[]
  onClick: () => void
}

export function DayCircle({
  date,
  isToday,
  isPast,
  events,
  onClick,
}: DayCircleProps) {
  const dayNumber = date.getDate()
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })

  // Limit visible events to 6, show "+X" for overflow
  const maxVisible = 6
  const visibleEvents = events.slice(0, maxVisible)
  const overflowCount = events.length - maxVisible

  if (isToday) {
    // Use TodayCircle component for today
    return null // This will be handled by TodayCircle
  }

  return (
    <button
      onClick={onClick}
      onMouseDown={(e) => e.stopPropagation()}
      className={`
        relative flex flex-col items-center justify-center
        w-24 h-24 sm:w-28 sm:h-28
        rounded-full border-2 border-border
        bg-card hover:bg-accent/50
        transition-all duration-200
        hover:scale-110
        ${isPast ? 'opacity-50' : 'opacity-90'}
        group
        select-none
      `}
      aria-label={`${dayName}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
    >
      {/* Date number */}
      <span className="text-base sm:text-lg font-semibold text-foreground">
        {dayNumber}
      </span>

      {/* Day name */}
      <span className="text-xs sm:text-sm text-muted-foreground mt-1">
        {dayName}
      </span>

      {/* Event dots at bottom */}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1 flex-wrap px-2">
        {visibleEvents.length > 0 ? (
          <>
            {visibleEvents.slice(0, 6).map((event) => (
              <div key={event._id} className="pointer-events-auto">
                <EventDot event={event} size="sm" />
              </div>
            ))}
            {overflowCount > 0 && (
              <span className="text-[10px] font-medium text-muted-foreground">
                +{overflowCount}
              </span>
            )}
          </>
        ) : (
          <span className="text-[10px] text-muted-foreground opacity-50">
            No events
          </span>
        )}
      </div>
    </button>
  )
}

