'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { format } from 'date-fns'
import type { CalendarEvent } from '../CalendarShell'

interface DayExpansionProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  events: CalendarEvent[]
  onEditEvent: (event: CalendarEvent) => void
  onCreateEvent?: (date: Date) => void
  onEventDeleted?: () => void
}

export function DayExpansion({
  open,
  onOpenChange,
  date,
  events,
  onEditEvent,
  onCreateEvent,
  onEventDeleted,
}: DayExpansionProps) {
  const deleteEvent = useMutation(api.events.deleteEvent)

  const handleDelete = async (event: CalendarEvent) => {
    await deleteEvent({ id: event._id })
    onEventDeleted?.()
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {format(date, 'EEEE, MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this day
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                style={{
                  borderLeftColor: event.color,
                  borderLeftWidth: '4px',
                }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  {!event.allDay && (
                    <p className="text-xs text-muted-foreground">
                      {formatTime(event.startTime)}
                    </p>
                  )}
                  {event.notes && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {event.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      onEditEvent(event)
                      onOpenChange(false)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(event)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={() => {
              onCreateEvent?.(date)
              onOpenChange(false)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

