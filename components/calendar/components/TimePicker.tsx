'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: string // Format: "HH:MM"
  onChange: (value: string) => void
  label: string
  id?: string
}

// Generate time slots in 30-minute intervals
const generateTimeSlots = () => {
  const slots: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      slots.push(`${h}:${m}`)
    }
  }
  return slots
}

const timeSlots = generateTimeSlots()

// Format time for display (12-hour format)
const formatDisplayTime = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours % 12 || 12
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
}

// Detect if device is mobile
const isMobile = () => {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
         (window.matchMedia && window.matchMedia('(max-width: 768px)').matches)
}

export function TimePicker({ value, onChange, label, id }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startYRef = useRef(0)
  const currentYRef = useRef(0)
  const velocityRef = useRef(0)
  const lastTimeRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Detect mobile on mount
  useEffect(() => {
    setIsMobileDevice(isMobile())
  }, [])

  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Find current index
  const currentIndex = timeSlots.findIndex((slot) => slot === value)
  const displayIndex = currentIndex >= 0 ? currentIndex : 0

  // Scroll to selected time
  const scrollToIndex = useCallback((index: number, smooth = true) => {
    if (!scrollRef.current) return
    
    const itemHeight = 48
    const scrollPosition = index * itemHeight - scrollRef.current.offsetHeight / 2 + itemHeight / 2
    
    scrollRef.current.scrollTo({
      top: scrollPosition,
      behavior: smooth ? 'smooth' : 'auto',
    })
  }, [])

  // Initialize scroll position for mobile
  useEffect(() => {
    if (isOpen && isMobileDevice && scrollRef.current) {
      setTimeout(() => {
        scrollToIndex(displayIndex, false)
      }, 50)
    }
  }, [isOpen, isMobileDevice, displayIndex, scrollToIndex])

  // Handle scroll to update value (mobile only)
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !isMobileDevice) return

    const scrollTop = scrollRef.current.scrollTop
    const itemHeight = 48
    const centerOffset = scrollRef.current.offsetHeight / 2 - itemHeight / 2
    const index = Math.round((scrollTop + centerOffset) / itemHeight)
    const clampedIndex = Math.max(0, Math.min(index, timeSlots.length - 1))
    
    const newValue = timeSlots[clampedIndex]
    if (newValue !== localValue) {
      setLocalValue(newValue)
      onChange(newValue)
    }
  }, [localValue, onChange, isMobileDevice])

  // Mouse wheel handler for desktop (30-minute intervals)
  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isOpen || isMobileDevice || !containerRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const delta = e.deltaY
    const currentIndex = timeSlots.findIndex((slot) => slot === localValue)
    
    if (delta > 0) {
      // Scroll down - next 30 minutes
      const nextIndex = Math.min(currentIndex + 1, timeSlots.length - 1)
      const newValue = timeSlots[nextIndex]
      setLocalValue(newValue)
      onChange(newValue)
    } else {
      // Scroll up - previous 30 minutes
      const prevIndex = Math.max(currentIndex - 1, 0)
      const newValue = timeSlots[prevIndex]
      setLocalValue(newValue)
      onChange(newValue)
    }
  }, [isOpen, isMobileDevice, localValue, onChange])

  // Touch handlers for mobile wheel
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobileDevice) return
    isDraggingRef.current = true
    startYRef.current = e.touches[0].clientY
    currentYRef.current = startYRef.current
    lastTimeRef.current = Date.now()
    velocityRef.current = 0
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [isMobileDevice])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDraggingRef.current || !isMobileDevice || !scrollRef.current) return
    
    e.preventDefault()
    const currentY = e.touches[0].clientY
    const deltaY = currentY - currentYRef.current
    const now = Date.now()
    const deltaTime = now - lastTimeRef.current
    
    if (deltaTime > 0) {
      velocityRef.current = (deltaY / deltaTime) * 16
    }
    
    scrollRef.current.scrollTop -= deltaY
    currentYRef.current = currentY
    lastTimeRef.current = now
    handleScroll()
  }, [handleScroll, isMobileDevice])

  const animateMomentum = useCallback(() => {
    if (!scrollRef.current || !isDraggingRef.current || !isMobileDevice) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
      return
    }
    
    const friction = 0.95
    if (scrollRef.current) {
      scrollRef.current.scrollTop -= velocityRef.current
      velocityRef.current *= friction
      handleScroll()
    }
    
    if (Math.abs(velocityRef.current) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(animateMomentum)
    } else {
      // Snap to nearest item
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop
        const itemHeight = 48
        const centerOffset = scrollRef.current.offsetHeight / 2 - itemHeight / 2
        const index = Math.round((scrollTop + centerOffset) / itemHeight)
        const clampedIndex = Math.max(0, Math.min(index, timeSlots.length - 1))
        scrollToIndex(clampedIndex)
      }
      animationFrameRef.current = null
    }
  }, [handleScroll, scrollToIndex, isMobileDevice])

  const handleTouchEnd = useCallback(() => {
    if (!isMobileDevice) return
    isDraggingRef.current = false
    
    if (Math.abs(velocityRef.current) > 0.5) {
      animationFrameRef.current = requestAnimationFrame(animateMomentum)
    } else {
      // Snap to nearest item
      if (scrollRef.current) {
        const scrollTop = scrollRef.current.scrollTop
        const itemHeight = 48
        const centerOffset = scrollRef.current.offsetHeight / 2 - itemHeight / 2
        const index = Math.round((scrollTop + centerOffset) / itemHeight)
        const clampedIndex = Math.max(0, Math.min(index, timeSlots.length - 1))
        scrollToIndex(clampedIndex)
      }
    }
  }, [animateMomentum, scrollToIndex, isMobileDevice])

  // Attach wheel listener for desktop only
  useEffect(() => {
    if (isMobileDevice) return
    
    const container = containerRef.current
    if (!container || !isOpen) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [isOpen, isMobileDevice, handleWheel])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Desktop: Simple dropdown
  if (!isMobileDevice) {
    return (
      <div className="space-y-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <div className="relative" ref={containerRef}>
          <button
            type="button"
            id={id}
            onClick={() => setIsOpen(!isOpen)}
            onWheel={(e) => {
              if (!isOpen) {
                e.preventDefault()
                const delta = e.deltaY
                const currentIndex = timeSlots.findIndex((slot) => slot === localValue)
                
                if (delta > 0) {
                  const nextIndex = Math.min(currentIndex + 1, timeSlots.length - 1)
                  const newValue = timeSlots[nextIndex]
                  setLocalValue(newValue)
                  onChange(newValue)
                } else {
                  const prevIndex = Math.max(currentIndex - 1, 0)
                  const newValue = timeSlots[prevIndex]
                  setLocalValue(newValue)
                  onChange(newValue)
                }
              }
            }}
            className={cn(
              'w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm',
              'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'transition-colors'
            )}
          >
            {formatDisplayTime(localValue)}
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-y-auto">
              {timeSlots.map((time) => {
                const isSelected = time === localValue
                return (
                  <button
                    key={time}
                    type="button"
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-colors',
                      'hover:bg-accent focus:bg-accent focus:outline-none',
                      isSelected && 'bg-accent font-semibold'
                    )}
                    onClick={() => {
                      setLocalValue(time)
                      onChange(time)
                      setIsOpen(false)
                    }}
                  >
                    {formatDisplayTime(time)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Mobile: iOS-style wheel picker
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          id={id}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm',
            'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            'transition-colors'
          )}
        >
          {formatDisplayTime(localValue)}
        </button>

        {isOpen && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
            <div
              ref={scrollRef}
              className="relative h-48 overflow-y-auto overscroll-contain scroll-smooth"
              style={{
                scrollSnapType: 'y mandatory',
                scrollPaddingTop: '96px',
                scrollPaddingBottom: '96px',
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onScroll={handleScroll}
            >
              {/* Top fade */}
              <div className="pointer-events-none absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-popover to-transparent z-10" />
              
              {/* Time slots */}
              <div className="py-20">
                {timeSlots.map((time, index) => {
                  const isSelected = time === localValue
                  return (
                    <div
                      key={time}
                      className={cn(
                        'flex items-center justify-center h-12 px-4 cursor-pointer transition-all',
                        'scroll-snap-align-center',
                        isSelected
                          ? 'text-lg font-semibold text-foreground scale-110'
                          : 'text-sm text-muted-foreground opacity-60'
                      )}
                      onClick={() => {
                        setLocalValue(time)
                        onChange(time)
                        scrollToIndex(index)
                      }}
                    >
                      {formatDisplayTime(time)}
                    </div>
                  )
                })}
              </div>

              {/* Bottom fade */}
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-popover to-transparent z-10" />
              
              {/* Center indicator */}
              <div className="pointer-events-none absolute top-1/2 left-0 right-0 h-12 -translate-y-1/2 border-t border-b border-border/50 z-20" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
