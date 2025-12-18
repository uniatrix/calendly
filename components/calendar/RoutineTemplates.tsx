'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sparkles } from 'lucide-react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

interface RoutineTemplate {
  name: string
  duration: number // minutes
  color: string
  recurrence?: string
}

const templates: RoutineTemplate[] = [
  {
    name: 'Morning Routine',
    duration: 60,
    color: '#3b82f6', // blue
    recurrence: 'FREQ=DAILY',
  },
  {
    name: 'Workout',
    duration: 60,
    color: '#10b981', // green
    recurrence: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
  },
  {
    name: 'Deep Work',
    duration: 120,
    color: '#8b5cf6', // purple
  },
  {
    name: 'Lunch Break',
    duration: 30,
    color: '#f59e0b', // orange
    recurrence: 'FREQ=DAILY',
  },
  {
    name: 'Evening Routine',
    duration: 45,
    color: '#ec4899', // pink
    recurrence: 'FREQ=DAILY',
  },
  {
    name: 'Weekly Review',
    duration: 90,
    color: '#6366f1', // indigo
    recurrence: 'FREQ=WEEKLY;BYDAY=FR',
  },
]

interface RoutineTemplatesProps {
  onSelect?: () => void
}

export function RoutineTemplates({ onSelect }: RoutineTemplatesProps) {
  const createEvent = useMutation(api.events.createEvent)

  const handleTemplateSelect = async (template: RoutineTemplate) => {
    const now = new Date()
    const startTime = now.getTime()
    const endTime = startTime + template.duration * 60 * 1000

    await createEvent({
      title: template.name,
      startTime,
      endTime,
      allDay: false,
      color: template.color,
      recurrence: template.recurrence || null,
      notes: null,
    })

    onSelect?.()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Sparkles className="mr-2 h-4 w-4" />
          Routines
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {templates.map((template) => (
          <DropdownMenuItem
            key={template.name}
            onClick={() => handleTemplateSelect(template)}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: template.color }}
              />
              <span>{template.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

