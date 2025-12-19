'use client'

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { CalendarEvent } from '../CalendarShell'

interface EventDotProps {
  event: CalendarEvent
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export function EventDot({ event, size = 'sm', onClick }: EventDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={`${sizeClasses[size]} rounded-full transition-all hover:scale-125 hover:shadow-md`}
            style={{ backgroundColor: event.color }}
            aria-label={event.title}
          />
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{event.title}</p>
            {!event.allDay && (
              <p className="text-xs text-muted-foreground">
                {formatTime(event.startTime)}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

