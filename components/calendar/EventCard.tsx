'use client'

import { Pencil, Trash2, Repeat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { CalendarEvent } from './CalendarShell'

interface EventCardProps {
  event: CalendarEvent
  variant: 'month' | 'week' | 'day'
  onEdit: (event: CalendarEvent) => void
  onDelete?: () => void
}

export function EventCard({ event, variant, onEdit, onDelete }: EventCardProps) {
  const deleteEvent = useMutation(api.events.deleteEvent)

  const handleDelete = async () => {
    await deleteEvent({ id: event._id })
    onDelete?.()
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  const isRecurring = event.recurrence !== null

  const cardContent = (
    <div
      className="group relative flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-all hover:opacity-90 hover:shadow-sm cursor-pointer"
      style={{
        backgroundColor: `${event.color}20`,
        borderLeft: `4px solid ${event.color}`,
      }}
      role="button"
      tabIndex={0}
      onDoubleClick={() => onEdit(event)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onEdit(event)
        } else if (e.key === 'Delete') {
          handleDelete()
        }
      }}
    >
      {variant === 'month' && !event.allDay && (
        <span className="text-[10px] font-medium text-muted-foreground">
          {formatTime(event.startTime)}
        </span>
      )}
      <span className="flex-1 truncate font-medium">{event.title}</span>
      {isRecurring && (
        <Repeat className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
      )}
      <div className="absolute right-1 top-1 hidden items-center gap-1 group-hover:flex">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(event)
          }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{cardContent}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onEdit(event)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

