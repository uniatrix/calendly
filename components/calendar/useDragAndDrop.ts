'use client'

import { useState, useRef } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { CalendarEvent } from './CalendarShell'
import type { Id } from '@/convex/_generated/dataModel'

interface DragState {
  event: CalendarEvent
  startX: number
  startY: number
  originalStartTime: number
  originalEndTime: number
}

const SNAP_INTERVAL = 15 // minutes

export function useDragAndDrop(
  onEventUpdate?: () => void
) {
  const [dragState, setDragState] = useState<DragState | null>(null)
  const updateEvent = useMutation(api.events.updateEvent)
  const containerRef = useRef<HTMLDivElement>(null)

  const snapToGrid = (minutes: number): number => {
    return Math.round(minutes / SNAP_INTERVAL) * SNAP_INTERVAL
  }

  const calculateNewTime = (
    clientY: number,
    containerRect: DOMRect,
    originalTime: number,
    isResize: boolean
  ): number => {
    const relativeY = clientY - containerRect.top
    const percent = relativeY / containerRect.height
    const totalMinutes = percent * 24 * 60
    const snappedMinutes = snapToGrid(totalMinutes)

    if (snappedMinutes < 0) return originalTime
    if (snappedMinutes >= 24 * 60) return originalTime

    const date = new Date(originalTime)
    const originalMinutes = date.getHours() * 60 + date.getMinutes()
    const diffMinutes = snappedMinutes - originalMinutes

    const newTime = new Date(originalTime)
    newTime.setMinutes(date.getMinutes() + diffMinutes)

    return newTime.getTime()
  }

  const handleDragStart = (
    event: CalendarEvent,
    e: React.DragEvent
  ) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', event._id)

    setDragState({
      event,
      startX: e.clientX,
      startY: e.clientY,
      originalStartTime: event.startTime,
      originalEndTime: event.endTime,
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (
    e: React.DragEvent,
    targetDate: Date
  ) => {
    e.preventDefault()

    if (!dragState || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newStartTime = calculateNewTime(
      e.clientY,
      containerRect,
      dragState.originalStartTime,
      false
    )

    const duration =
      dragState.originalEndTime - dragState.originalStartTime
    const newEndTime = newStartTime + duration

    // Update date if dropped on different day
    const originalDate = new Date(dragState.originalStartTime)
    const targetDateStart = new Date(targetDate)
    targetDateStart.setHours(0, 0, 0, 0)

    if (
      originalDate.toDateString() !== targetDate.toDateString()
    ) {
      const dayDiff =
        (targetDateStart.getTime() - originalDate.getTime()) /
        (1000 * 60 * 60 * 24)
      const adjustedStartTime = new Date(newStartTime)
      adjustedStartTime.setDate(adjustedStartTime.getDate() + dayDiff)
      const adjustedEndTime = new Date(newEndTime)
      adjustedEndTime.setDate(adjustedEndTime.getDate() + dayDiff)

      await updateEvent({
        id: dragState.event._id,
        startTime: adjustedStartTime.getTime(),
        endTime: adjustedEndTime.getTime(),
      })
    } else {
      await updateEvent({
        id: dragState.event._id,
        startTime: newStartTime,
        endTime: newEndTime,
      })
    }

    setDragState(null)
    onEventUpdate?.()
  }

  const handleResize = async (
    event: CalendarEvent,
    e: React.MouseEvent,
    resizeType: 'start' | 'end'
  ) => {
    if (!containerRef.current) return

    const startY = e.clientY
    const originalTime =
      resizeType === 'start' ? event.startTime : event.endTime

    const handleMouseMove = async (moveEvent: MouseEvent) => {
      const containerRect =
        containerRef.current?.getBoundingClientRect()
      if (!containerRect) return

      const newTime = calculateNewTime(
        moveEvent.clientY,
        containerRect,
        originalTime,
        true
      )

      if (resizeType === 'start') {
        if (newTime < event.endTime) {
          await updateEvent({
            id: event._id,
            startTime: newTime,
          })
        }
      } else {
        if (newTime > event.startTime) {
          await updateEvent({
            id: event._id,
            endTime: newTime,
          })
        }
      }
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      onEventUpdate?.()
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return {
    dragState,
    containerRef,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleResize,
  }
}

