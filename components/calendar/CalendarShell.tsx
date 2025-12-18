'use client'

import { useState, useEffect } from 'react'
import { CalendarHeader } from './CalendarHeader'
import { MonthView } from './views/MonthView'
import { WeekView } from './views/WeekView'
import { DayView } from './views/DayView'
import { EventDialog } from './EventDialog'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { Id } from '@/convex/_generated/dataModel'

export type CalendarView = 'month' | 'week' | 'day'

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
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)

  // Calculate date range based on view
  const getDateRange = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth() + 1
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    switch (view) {
      case 'month':
        return { year, month }
      case 'week':
        return { startDate: startOfWeek.getTime() }
      case 'day':
        return { date: selectedDate.getTime() }
    }
  }

  // Fetch events based on current view
  const monthEvents = useQuery(
    api.events.getEventsForMonth,
    view === 'month'
      ? {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
        }
      : 'skip'
  )

  const weekStart = (() => {
    const start = new Date(selectedDate)
    start.setDate(selectedDate.getDate() - selectedDate.getDay())
    start.setHours(0, 0, 0, 0)
    return start.getTime()
  })()

  const weekEvents = useQuery(
    api.events.getEventsForWeek,
    view === 'week' ? { startDate: weekStart } : 'skip'
  )

  const dayEvents = useQuery(
    api.events.getEventsForDay,
    view === 'day' ? { date: selectedDate.getTime() } : 'skip'
  )

  const events =
    view === 'month'
      ? monthEvents ?? []
      : view === 'week'
        ? weekEvents ?? []
        : dayEvents ?? []

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
        setSelectedDate(new Date())
      } else if (e.key === 'm' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView('month')
      } else if (e.key === 'w' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView('week')
      } else if (e.key === 'd' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setView('day')
      } else if (e.key === 'ArrowLeft' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        navigateDate(-1)
      } else if (e.key === 'ArrowRight' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        navigateDate(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [view, selectedDate])

  const navigateDate = (direction: number) => {
    const newDate = new Date(selectedDate)
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7)
    } else {
      newDate.setDate(newDate.getDate() + direction)
    }
    setSelectedDate(newDate)
  }

  const handleNewEvent = () => {
    setEditingEvent(null)
    setIsEventDialogOpen(true)
  }

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event)
    setIsEventDialogOpen(true)
  }

  const handleEventCreated = () => {
    setIsEventDialogOpen(false)
    setEditingEvent(null)
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <CalendarHeader
        view={view}
        onViewChange={setView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onNavigate={navigateDate}
        onNewEvent={handleNewEvent}
      />
      <div className="flex-1 overflow-hidden">
        <div className="h-full transition-opacity duration-200">
          {view === 'month' && (
            <MonthView
              selectedDate={selectedDate}
              events={events as CalendarEvent[]}
              onEventClick={handleEditEvent}
              onDateClick={(date) => {
                setSelectedDate(date)
                setView('day')
              }}
            />
          )}
          {view === 'week' && (
            <WeekView
              selectedDate={selectedDate}
              events={events as CalendarEvent[]}
              onEventClick={handleEditEvent}
            />
          )}
          {view === 'day' && (
            <DayView
              selectedDate={selectedDate}
              events={events as CalendarEvent[]}
              onEventClick={handleEditEvent}
            />
          )}
        </div>
      </div>
      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={editingEvent}
        defaultDate={selectedDate}
        onSuccess={handleEventCreated}
      />
    </div>
  )
}

