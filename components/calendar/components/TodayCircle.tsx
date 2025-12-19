'use client'

import { forwardRef } from 'react'
import { EventDot } from './EventDot'
import type { CalendarEvent } from '../CalendarShell'

interface TodayCircleProps {
  date: Date
  events: CalendarEvent[]
  onClick: () => void
}

export const TodayCircle = forwardRef<HTMLButtonElement, TodayCircleProps>(
  ({ date, events, onClick }, ref) => {
  const dayNumber = date.getDate()
  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
  const totalEvents = events.length

  // Limit visible events to 8 for today (larger circle)
  const maxVisible = 8
  const visibleEvents = events.slice(0, maxVisible)
  const overflowCount = events.length - maxVisible

    return (
      <button
        ref={ref}
        onClick={onClick}
        onMouseDown={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center justify-center
          w-48 h-48 sm:w-56 sm:h-56
          rounded-full border-4 border-primary
          bg-card hover:bg-accent/50
          transition-all duration-200
          hover:scale-105
          group
          animate-pulse-glow
          select-none
        "
        aria-label={`Today, ${dayName}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`}
      >
      {/* Completion stats */}
      {totalEvents > 0 && (
        <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center">
          {totalEvents}
        </div>
      )}

      {/* Date number */}
      <span className="text-4xl sm:text-5xl font-bold text-foreground">
        {dayNumber}
      </span>

      {/* Day name */}
      <span className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
        {dayName}
      </span>

      {/* Event dots at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-1.5 flex-wrap px-3">
        {visibleEvents.length > 0 ? (
          <>
            {visibleEvents.slice(0, 8).map((event) => (
              <div key={event._id} className="pointer-events-auto">
                <EventDot event={event} size="md" />
              </div>
            ))}
            {overflowCount > 0 && (
              <span className="text-xs font-medium text-muted-foreground">
                +{overflowCount}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-muted-foreground opacity-50">
            No events
          </span>
        )}
      </div>
      </button>
    )
  }
)

TodayCircle.displayName = 'TodayCircle'

