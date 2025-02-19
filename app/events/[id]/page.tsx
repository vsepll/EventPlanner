"use client"

import { Suspense } from "react"
import { EventDashboard } from "@/components/EventDashboard"
import { Skeleton } from "@/components/ui/skeleton"
import { EventProvider } from "@/contexts/EventContext"

export default function EventPage({ params }: { params: { id: string } }) {
  return (
    <EventProvider eventId={params.id}>
      <Suspense
        fallback={
          <div className="container mx-auto py-8">
            <Skeleton className="h-[500px] w-full" />
          </div>
        }
      >
        <EventDashboard eventId={params.id} />
      </Suspense>
    </EventProvider>
  )
}

