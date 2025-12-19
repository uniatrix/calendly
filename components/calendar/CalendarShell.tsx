'use client'

import { useState, useEffect } from 'react'
import { CalendarHeader } from './CalendarHeader'
import { TimelineView } from './views/TimelineView'
import { EventDialog } from './EventDialog'
import { DayExpansion } from './components/DayExpansion'
import { YearViewModal } from './components/YearViewModal'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export interface CalendarEvent {
  _id: Id<'events'>
  title: string
  startTime: number
  endTime: number
  allDay: boolean
  color: string
  recurrence: string | null
  notes: string | null
  userId: string
}

export function CalendarShell() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [isDayExpansionOpen, setIsDayExpansionOpen] = useState(false)
  const [expandedDate, setExpandedDate] = useState<Date | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() }
  })

  // Calculate date range for current month
  const startDate = new Date(currentMonth.year, currentMonth.month, 1)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date(currentMonth.year, currentMonth.month + 1, 0)
  endDate.setHours(23, 59, 59, 999)

  // Fetch events for current month
  const events = useQuery(
    api.events.getEventsForRange,
    {
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    }
  ) ?? []

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setEditingEvent(null)
        setIsEventDialogOpen(true)
      } else if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        const today = new Date()
        setSelectedDate(today)
        setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() })
      } else if (e.key === ' ' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Spacebar to return to today regardless of current month
        e.preventDefault()
        const today = new Date()
        setSelectedDate(today)
        setCurrentMonth({ year: today.getFullYear(), month: today.getMonth() })
      } else if (e.key === 'Escape') {
        setIsDayExpansionOpen(false)
        setIsEventDialogOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNewEvent = () => {
    setEditingEvent(null)
    setIsEventDialogOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleCreateEvent = (date: Date) => {
    setEditingEvent(null)
    setSelectedDate(date)
    setIsEventDialogOpen(true)
  }

  const handleEventCreated = () => {
    setIsEventDialogOpen(false)
    setEditingEvent(null)
  }

  const handleDayClick = (date: Date) => {
    setExpandedDate(date)
    setSelectedDate(date)
    setIsDayExpansionOpen(true)
  }

  // Scroll to today when "Today" button is clicked
  const handleTodayClick = () => {
    setSelectedDate(new Date())
    // TimelineView will handle scrolling
  }

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    return (events as CalendarEvent[]).filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= dateStart && eventStart <= dateEnd
    })
  }

  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col bg-background">
      <CalendarHeader
        selectedDate={selectedDate}
        onDateChange={handleTodayClick}
        onNewEvent={handleNewEvent}
      />
      <div className="flex-1 min-w-0">
        <TimelineView
          selectedDate={selectedDate}
          events={events as CalendarEvent[]}
          onDayClick={handleDayClick}
          onDateChange={setSelectedDate}
          onMonthChange={(year, month) => setCurrentMonth({ year, month })}
          currentMonth={currentMonth}
          onFullCalendarClick={() => setIsFullCalendarOpen(true)}
        />
      </div>
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={editingEvent}
        defaultDate={selectedDate}
        onSuccess={handleEventCreated}
      />
          {expandedDate && (
            <DayExpansion
              open={isDayExpansionOpen}
              onOpenChange={setIsDayExpansionOpen}
              date={expandedDate}
              events={getEventsForDate(expandedDate)}
              onEditEvent={handleEditEvent}
              onCreateEvent={handleCreateEvent}
              onEventDeleted={() => {
                // Events will refresh automatically via query
              }}
            />
          )}
          <YearViewModal
            open={isFullCalendarOpen}
            onOpenChange={setIsFullCalendarOpen}
            currentDate={selectedDate}
            onMonthSelect={(date) => {
              setSelectedDate(date)
              setCurrentMonth({ year: date.getFullYear(), month: date.getMonth() })
            }}
            events={events as CalendarEvent[]}
          />
        </div>
      )
    }

