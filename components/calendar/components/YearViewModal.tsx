'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { RegularCalendarView } from './RegularCalendarView'
import type { CalendarEvent } from '../CalendarShell'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils'

interface YearViewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentDate: Date
  onMonthSelect: (date: Date) => void
  events: CalendarEvent[]
}

export function YearViewModal({
  open,
  onOpenChange,
  currentDate,
  onMonthSelect,
  events,
}: YearViewModalProps) {
  const [view, setView] = useState<'year' | 'month' | 'calendar'>('month')
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null)

  const currentYear = currentDate.getFullYear()
  const years = Array.from({ length: 12 }, (_, i) => currentYear - 5 + i)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const handleYearClick = (year: number) => {
    setSelectedYear(year)
    setView('month')
  }

  const handleMonthClick = (monthIndex: number) => {
    const selectedDate = new Date(selectedYear, monthIndex, 1)
    setSelectedMonth(selectedDate)
    setView('calendar')
  }

  const handleDateSelect = (date: Date) => {
    onMonthSelect(date)
    onOpenChange(false)
    // Reset view state
    setView('month')
    setSelectedMonth(null)
    setSelectedYear(currentYear)
  }

  const handleBackToMonths = () => {
    setView('month')
    setSelectedMonth(null)
  }

  const handleBackToYears = () => {
    setView('year')
  }

  const handlePreviousYear = () => {
    setSelectedYear(selectedYear - 1)
  }

  const handleNextYear = () => {
    setSelectedYear(selectedYear + 1)
  }

  const isCurrentMonth = (monthIndex: number) => {
    return currentDate.getMonth() === monthIndex && currentDate.getFullYear() === selectedYear
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset view state
    setView('month')
    setSelectedMonth(null)
    setSelectedYear(currentYear)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* Custom overlay with enhanced fade animation */}
      <DialogPrimitive.Overlay
        className={cn(
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-md transition-all duration-500 ease-in-out"
        )}
      />
      <DialogContent 
        className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {view === 'year' && 'Select Year'}
            {view === 'month' && ''}
            {view === 'calendar' && ''}
          </DialogTitle>
        </DialogHeader>

        {view === 'year' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 py-4">
            {years.map((year) => (
              <Button
                key={year}
                variant={year === currentYear ? 'default' : 'outline'}
                className={`
                  h-16 sm:h-20 flex items-center justify-center
                  ${year === currentYear ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                  hover:scale-105 transition-all
                `}
                onClick={() => handleYearClick(year)}
              >
                <span className="text-base sm:text-lg font-semibold">{year}</span>
              </Button>
            ))}
          </div>
        )}

        {view === 'month' && (
          <div>
            {/* Year selector with navigation arrows */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousYear}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBackToYears}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-lg font-semibold">{selectedYear}</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextYear}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 py-4">
              {months.map((month, index) => (
                <Button
                  key={index}
                  variant={isCurrentMonth(index) ? 'default' : 'outline'}
                  className={`
                    h-20 sm:h-24 flex items-center justify-center
                    ${isCurrentMonth(index) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                    hover:scale-105 transition-all
                  `}
                  onClick={() => handleMonthClick(index)}
                >
                  <span className="text-sm sm:text-base font-semibold">{month}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {view === 'calendar' && selectedMonth && (
          <div>
            <RegularCalendarView
              date={selectedMonth}
              events={events}
              onDateSelect={handleDateSelect}
              onMonthChange={setSelectedMonth}
              onBackToMonths={handleBackToMonths}
            />
          </div>
        )}

      </DialogContent>
    </Dialog>
  )
}
