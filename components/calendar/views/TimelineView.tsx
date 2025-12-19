'use client'

import { useMemo, useRef, useEffect, useState, useCallback } from 'react'
import { DayCircle } from '../components/DayCircle'
import { TodayCircle } from '../components/TodayCircle'
import { YearViewModal } from '../components/YearViewModal'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { CalendarEvent } from '../CalendarShell'

interface TimelineViewProps {
  selectedDate: Date
  events: CalendarEvent[]
  onDayClick: (date: Date) => void
  onDateChange?: (date: Date) => void
  onMonthChange?: (year: number, month: number) => void
  currentMonth?: { year: number; month: number }
  onFullCalendarClick?: () => void
}

export function TimelineView({
  selectedDate,
  events,
  onDayClick,
  onDateChange,
  onMonthChange,
  currentMonth: externalCurrentMonth,
  onFullCalendarClick,
}: TimelineViewProps) {
  const todayRef = useRef<HTMLButtonElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [internalCurrentMonth, setInternalCurrentMonth] = useState(() => {
    const today = new Date()
    return { year: today.getFullYear(), month: today.getMonth() }
  })
  
  // Use external currentMonth if provided, otherwise use internal state
  const currentMonth = externalCurrentMonth ?? internalCurrentMonth
  
  // Sync internal state when external month changes
  useEffect(() => {
    if (externalCurrentMonth) {
      setInternalCurrentMonth(externalCurrentMonth)
    }
  }, [externalCurrentMonth])
  const [isYearModalOpen, setIsYearModalOpen] = useState(false)
  const [showExpandButton, setShowExpandButton] = useState({ left: false, right: false })
  
  // Drag state for smooth desktop dragging
  const dragStateRef = useRef<{
    isDragging: boolean
    startX: number
    startScrollLeft: number
    lastX: number
    lastTime: number
    velocity: number
    animationFrame: number | null
  }>({
    isDragging: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastTime: 0,
    velocity: 0,
    animationFrame: null,
  })

  // Generate days for current month only
  const days = useMemo(() => {
    const firstDayOfMonth = new Date(currentMonth.year, currentMonth.month, 1)
    const lastDayOfMonth = new Date(currentMonth.year, currentMonth.month + 1, 0)
    
    const daysArray: Date[] = []
    
    // Get all days in the current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.year, currentMonth.month, day)
      daysArray.push(date)
    }
    
    return daysArray
  }, [currentMonth])

  const handleMonthSelect = (date: Date) => {
    const newMonth = {
      year: date.getFullYear(),
      month: date.getMonth(),
    }
    if (externalCurrentMonth) {
      onMonthChange?.(newMonth.year, newMonth.month)
    } else {
      setInternalCurrentMonth(newMonth)
      onMonthChange?.(newMonth.year, newMonth.month)
    }
    onDateChange?.(date)
    
    // Scroll to today if it's in the selected month, otherwise scroll to first day
    setTimeout(() => {
      const today = new Date()
      const isTodayInMonth = 
        today.getMonth() === date.getMonth() && 
        today.getFullYear() === date.getFullYear()
      
      if (isTodayInMonth) {
        scrollToToday()
      } else {
        // Scroll to first day of month
        if (containerRef.current) {
          containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        }
      }
    }, 100)
  }

  const handlePreviousMonth = () => {
    const newMonth = currentMonth.month === 0 ? 11 : currentMonth.month - 1
    const newYear = currentMonth.month === 0 ? currentMonth.year - 1 : currentMonth.year
    const newMonthState = { year: newYear, month: newMonth }
    
    // Smooth scroll to start of new month
    if (containerRef.current) {
      containerRef.current.style.transition = 'opacity 0.2s ease-out'
      containerRef.current.style.opacity = '0.7'
      
      setTimeout(() => {
        if (externalCurrentMonth) {
          onMonthChange?.(newYear, newMonth)
        } else {
          setInternalCurrentMonth(newMonthState)
          onMonthChange?.(newYear, newMonth)
        }
        
        // Scroll to start and fade back in
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
            containerRef.current.style.transition = 'opacity 0.3s ease-in'
            containerRef.current.style.opacity = '1'
          }
        }, 50)
      }, 200)
    } else {
      if (externalCurrentMonth) {
        onMonthChange?.(newYear, newMonth)
      } else {
        setInternalCurrentMonth(newMonthState)
        onMonthChange?.(newYear, newMonth)
      }
    }
  }

  const handleNextMonth = () => {
    const newMonth = currentMonth.month === 11 ? 0 : currentMonth.month + 1
    const newYear = currentMonth.month === 11 ? currentMonth.year + 1 : currentMonth.year
    const newMonthState = { year: newYear, month: newMonth }
    
    // Smooth scroll to start of new month
    if (containerRef.current) {
      containerRef.current.style.transition = 'opacity 0.2s ease-out'
      containerRef.current.style.opacity = '0.7'
      
      setTimeout(() => {
        if (externalCurrentMonth) {
          onMonthChange?.(newYear, newMonth)
        } else {
          setInternalCurrentMonth(newMonthState)
          onMonthChange?.(newYear, newMonth)
        }
        
        // Scroll to start and fade back in
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
            containerRef.current.style.transition = 'opacity 0.3s ease-in'
            containerRef.current.style.opacity = '1'
          }
        }, 50)
      }, 200)
    } else {
      if (externalCurrentMonth) {
        onMonthChange?.(newYear, newMonth)
      } else {
        setInternalCurrentMonth(newMonthState)
        onMonthChange?.(newYear, newMonth)
      }
    }
  }

  // Check if we're at month boundaries and show expand buttons
  // Smooth momentum scrolling animation
  const animateMomentum = useCallback(() => {
    const state = dragStateRef.current
    if (!state.isDragging && state.velocity !== 0 && containerRef.current) {
      const container = containerRef.current
      
      // Apply velocity with friction
      container.scrollLeft -= state.velocity
      state.velocity *= 0.95 // Friction factor
      
      // Stop when velocity is too small
      if (Math.abs(state.velocity) < 0.5) {
        state.velocity = 0
        if (state.animationFrame) {
          cancelAnimationFrame(state.animationFrame)
          state.animationFrame = null
        }
      } else {
        state.animationFrame = requestAnimationFrame(animateMomentum)
      }
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const checkScrollPosition = () => {
      const scrollLeft = container.scrollLeft
      const scrollWidth = container.scrollWidth
      const clientWidth = container.clientWidth

      // Show expand button when near the start (first few days visible)
      const atStart = scrollLeft < 100
      // Show expand button when near the end (last few days visible)
      const atEnd = scrollLeft + clientWidth > scrollWidth - 100

      setShowExpandButton({
        left: atStart,
        right: atEnd,
      })
    }

    // Check on mount and when month changes
    const timeoutId = setTimeout(checkScrollPosition, 100)

    // Also check on scroll
    container.addEventListener('scroll', checkScrollPosition)
    
    // Convert vertical wheel scrolling to horizontal scrolling
    const handleWheel = (e: WheelEvent) => {
      // Only intercept if scrolling vertically (deltaY is larger than deltaX)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()
        // Multiply by 4 for faster scrolling
        container.scrollLeft += e.deltaY * 4
      }
    }
    
    // Mouse drag handlers for smooth desktop dragging
    const handleMouseDown = (e: MouseEvent) => {
      // Only start drag on left mouse button and not on interactive elements
      if (e.button !== 0) return
      
      const target = e.target as HTMLElement
      // Don't start drag if clicking on buttons, day circles, or other interactive elements
      if (
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('[data-no-drag]') ||
        target.closest('a')
      ) {
        return
      }

      e.preventDefault()
      e.stopPropagation()
      const state = dragStateRef.current
      state.isDragging = true
      state.startX = e.clientX
      state.startScrollLeft = container.scrollLeft
      state.lastX = e.clientX
      state.lastTime = Date.now()
      state.velocity = 0
      
      // Cancel any ongoing momentum animation
      if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame)
        state.animationFrame = null
      }

      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
      // Prevent text selection on all children
      const children = container.querySelectorAll('*')
      children.forEach((child) => {
        ;(child as HTMLElement).style.userSelect = 'none'
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      const state = dragStateRef.current
      if (!state.isDragging) return

      e.preventDefault()
      const deltaX = e.clientX - state.lastX
      const now = Date.now()
      const deltaTime = now - state.lastTime

      // Update scroll position with increased sensitivity (6x multiplier - 100% faster than 3x)
      const dragMultiplier = 6
      container.scrollLeft = state.startScrollLeft - (e.clientX - state.startX) * dragMultiplier

      // Calculate velocity for momentum scrolling with increased sensitivity
      if (deltaTime > 0) {
        state.velocity = (deltaX / deltaTime) * 16 * dragMultiplier // Normalize to 60fps and apply multiplier
      }

      state.lastX = e.clientX
      state.lastTime = now
    }

    const handleMouseUp = () => {
      const state = dragStateRef.current
      if (!state.isDragging) return

      state.isDragging = false
      container.style.cursor = 'grab'
      container.style.userSelect = ''
      // Restore text selection on all children
      const children = container.querySelectorAll('*')
      children.forEach((child) => {
        ;(child as HTMLElement).style.userSelect = ''
      })

      // Start momentum scrolling if velocity is significant
      if (Math.abs(state.velocity) > 0.5) {
        state.animationFrame = requestAnimationFrame(animateMomentum)
      } else {
        state.velocity = 0
      }
    }

    const handleMouseLeave = () => {
      const state = dragStateRef.current
      if (state.isDragging) {
        state.isDragging = false
        container.style.cursor = 'grab'
        container.style.userSelect = ''
        // Restore text selection on all children
        const children = container.querySelectorAll('*')
        children.forEach((child) => {
          ;(child as HTMLElement).style.userSelect = ''
        })
        
        // Start momentum scrolling if velocity is significant
        if (Math.abs(state.velocity) > 0.5) {
          state.animationFrame = requestAnimationFrame(animateMomentum)
        } else {
          state.velocity = 0
        }
      }
    }
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    container.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', checkScrollPosition)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mouseleave', handleMouseLeave)
      
      // Clean up animation frame
      const state = dragStateRef.current
      if (state.animationFrame) {
        cancelAnimationFrame(state.animationFrame)
      }
    }
  }, [currentMonth, days, animateMomentum])

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    const dateStart = new Date(date)
    dateStart.setHours(0, 0, 0, 0)
    const dateEnd = new Date(date)
    dateEnd.setHours(23, 59, 59, 999)

    return events.filter((event) => {
      const eventStart = new Date(event.startTime)
      return eventStart >= dateStart && eventStart <= dateEnd
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isPast = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  // Function to scroll to center today with smooth animation
  const scrollToToday = useCallback(() => {
    if (todayRef.current && containerRef.current) {
      const container = containerRef.current
      const todayElement = todayRef.current
      
      // Add fade effect during scroll
      container.style.transition = 'opacity 0.2s ease-out'
      container.style.opacity = '0.8'
      
      // Calculate scroll position to center today
      const containerWidth = container.offsetWidth
      const todayLeft = todayElement.offsetLeft
      const todayWidth = todayElement.offsetWidth
      
      const scrollPosition = todayLeft - containerWidth / 2 + todayWidth / 2
      
      // Smooth scroll with easing
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
      
      // Fade back in after scroll starts
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = 'opacity 0.4s ease-in'
          containerRef.current.style.opacity = '1'
        }
      }, 150)
    }
  }, [])

  // Auto-scroll to center today on mount and when selectedDate changes to today
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const isSelectedToday = 
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()

    if (isSelectedToday) {
      // Small delay to ensure layout is complete
      const timeoutId = setTimeout(() => {
        scrollToToday()
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [selectedDate, scrollToToday])


  // Helper to check if date is start of week (Sunday)
  const isStartOfWeek = (date: Date) => {
    return date.getDay() === 0
  }

  // Get week label (e.g., "Dec Week 1")
  const getWeekLabel = (date: Date) => {
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay()) // Get Sunday of the week
    
    // Calculate which week of the month this is (1-5)
    const firstDayOfMonth = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1)
    const daysSinceMonthStart = Math.floor((weekStart.getTime() - firstDayOfMonth.getTime()) / (24 * 60 * 60 * 1000))
    const weekNumber = Math.floor(daysSinceMonthStart / 7) + 1
    
    const monthName = weekStart.toLocaleDateString('en-US', { month: 'short' })
    return `${monthName} Week ${weekNumber}`
  }

  const currentMonthName = new Date(currentMonth.year, currentMonth.month).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="h-full w-full relative">
      {/* Month navigation buttons */}
      {showExpandButton.left && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-background/90 active:scale-95"
          onClick={handlePreviousMonth}
        >
          <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
        </Button>
      )}
      {showExpandButton.right && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-background/90 active:scale-95"
          onClick={handleNextMonth}
        >
          <ChevronRight className="h-4 w-4 transition-transform duration-200" />
        </Button>
      )}

      {/* Current month and year display - always visible and clickable */}
      <button
        onClick={() => onFullCalendarClick?.()}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-10 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <div className="flex flex-col items-center">
          <span className="text-2xl sm:text-3xl font-bold text-foreground">
            {new Date(currentMonth.year, currentMonth.month).toLocaleDateString('en-US', { month: 'long' })}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {currentMonth.year}
          </span>
        </div>
      </button>

      <div
        ref={containerRef}
        className="h-full w-full overflow-x-auto overflow-y-hidden scroll-smooth cursor-grab select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-opacity duration-300"
        style={{
          scrollSnapType: 'x mandatory',
          scrollPadding: '50%',
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorX: 'contain',
        }}
      >
        <div 
          className="flex items-center h-full px-8 sm:px-12"
          style={{ 
            minWidth: 'max-content',
            width: 'max-content',
          }}
        >
        {days.map((date, index) => {
          const dayEvents = getEventsForDate(date)
          const today = isToday(date)
          const past = isPast(date)
          const showWeekSeparator = index > 0 && isStartOfWeek(date)

          return (
            <div key={date.toISOString()} className="flex items-center">
              {/* Week Separator with label above - positioned between days */}
              {showWeekSeparator && index > 0 && (
                <div className="flex-shrink-0 flex flex-col items-center mx-3 sm:mx-4 relative">
                  <span className="absolute -top-5 sm:-top-6 text-[10px] sm:text-xs font-medium text-muted-foreground/70 whitespace-nowrap">
                    {getWeekLabel(date)}
                  </span>
                  <div className="w-px h-24 sm:h-32 bg-border/50" />
                </div>
              )}

              <div
                className="flex-shrink-0 mx-3 sm:mx-4"
                style={{ scrollSnapAlign: 'center' }}
                data-no-drag
              >
                {today ? (
                  <TodayCircle
                    ref={todayRef}
                    date={date}
                    events={dayEvents}
                    onClick={() => onDayClick(date)}
                  />
                ) : (
                  <DayCircle
                    date={date}
                    isToday={false}
                    isPast={past}
                    events={dayEvents}
                    onClick={() => onDayClick(date)}
                  />
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>

          <YearViewModal
            open={isYearModalOpen}
            onOpenChange={setIsYearModalOpen}
            currentDate={new Date(currentMonth.year, currentMonth.month, 1)}
            onMonthSelect={handleMonthSelect}
            events={events}
          />
    </div>
  )
}

