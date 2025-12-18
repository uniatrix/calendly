'use client'

import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton } from '@clerk/nextjs'
import { CalendarShell } from '@/components/calendar/CalendarShell'

export default function Home() {
  return (
    <>
      <Authenticated>
        <CalendarShell />
      </Authenticated>
      <Unauthenticated>
        <div className="flex h-screen items-center justify-center">
          <SignInButton />
        </div>
      </Unauthenticated>
    </>
  )
}