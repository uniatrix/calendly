'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from './CalendarShell'
import { TimePicker } from './components/TimePicker'

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  defaultDate: Date
  onSuccess: () => void
}

const eventColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Gray', value: '#6b7280' },
]

const recurrenceOptions = [
  { label: 'None', value: null },
  { label: 'Daily', value: 'FREQ=DAILY' },
  { label: 'Weekly', value: 'FREQ=WEEKLY' },
  { label: 'Monthly', value: 'FREQ=MONTHLY' },
  { label: 'Yearly', value: 'FREQ=YEARLY' },
]

export function EventDialog({
  open,
  onOpenChange,
  event,
  defaultDate,
  onSuccess,
}: EventDialogProps) {
  const createEvent = useMutation(api.events.createEvent)
  const updateEvent = useMutation(api.events.updateEvent)

  const [title, setTitle] = useState('')
  const [date, setDate] = useState<Date>(defaultDate)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [allDay, setAllDay] = useState(false)
  const [color, setColor] = useState(eventColors[0].value)
  const [recurrence, setRecurrence] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setDate(new Date(event.startTime))
      setStartTime(
        new Date(event.startTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
      setEndTime(
        new Date(event.endTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      )
      setAllDay(event.allDay)
      setColor(event.color)
      setRecurrence(event.recurrence)
      setNotes(event.notes || '')
    } else {
      // Reset to defaults for new event
      setTitle('')
      setDate(defaultDate)
      setStartTime('09:00')
      setEndTime('10:00')
      setAllDay(false)
      setColor(eventColors[0].value)
      setRecurrence(null)
      setNotes('')
    }
  }, [event, defaultDate, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const startDate = new Date(date)
    if (!allDay) {
      startDate.setHours(startHours, startMinutes, 0, 0)
    } else {
      startDate.setHours(0, 0, 0, 0)
    }

    const endDate = new Date(date)
    if (!allDay) {
      endDate.setHours(endHours, endMinutes, 0, 0)
    } else {
      endDate.setHours(23, 59, 59, 999)
    }

    const startTimeMs = startDate.getTime()
    const endTimeMs = endDate.getTime()

    if (event) {
      await updateEvent({
        id: event._id,
        title,
        startTime: startTimeMs,
        endTime: endTimeMs,
        allDay,
        color,
        recurrence,
        notes: notes || null,
      })
    } else {
      await createEvent({
        title,
        startTime: startTimeMs,
        endTime: endTimeMs,
        allDay,
        color,
        recurrence,
        notes: notes || null,
      })
    }

    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allDay"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <Label htmlFor="allDay">All day</Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <TimePicker
                id="startTime"
                label="Start time"
                value={startTime}
                onChange={setStartTime}
              />
              <TimePicker
                id="endTime"
                label="End time"
                value={endTime}
                onChange={setEndTime}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex gap-2">
              {eventColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    'h-8 w-8 rounded-full border-2 transition-all',
                    color === c.value
                      ? 'border-foreground scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recurrence">Recurrence</Label>
            <Select
              value={recurrence || 'none'}
              onValueChange={(value) =>
                setRecurrence(value === 'none' ? null : value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {recurrenceOptions.map((option) => (
                  <SelectItem
                    key={option.value || 'none'}
                    value={option.value || 'none'}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

