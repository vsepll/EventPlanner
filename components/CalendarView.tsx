"use client"

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Event } from '@/types/event'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { List } from 'lucide-react'
import esLocale from '@fullcalendar/core/locales/es'

interface CalendarViewProps {
  events: Event[]
  onViewChange: () => void
}

export function CalendarView({ events, onViewChange }: CalendarViewProps) {
  const router = useRouter()
  const [calendarEvents, setCalendarEvents] = useState<any[]>([])

  useEffect(() => {
    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.name,
      start: new Date(event.date),
      allDay: true,
      backgroundColor: '#3b82f6',
      borderColor: '#3b82f6',
      textColor: '#ffffff',
      extendedProps: {
        venue: event.venue,
        type: event.type,
        estimatedTickets: event.salesProjection.estimatedTickets,
        projectedProfit: event.salesProjection.projectedProfit
      }
    }))
    setCalendarEvents(formattedEvents)
  }, [events])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold tracking-tight">Calendario de Eventos</h2>
        <Button variant="outline" size="sm" onClick={onViewChange}>
          <List className="h-4 w-4 mr-2" />
          Vista Lista
        </Button>
      </div>

      <Card className="p-4">
        <div className="h-[700px]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={esLocale}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek'
            }}
            events={calendarEvents}
            eventClick={(info) => router.push(`/events/${info.event.id}`)}
            eventContent={(eventInfo) => (
              <div className="p-1">
                <div className="font-semibold">{eventInfo.event.title}</div>
                <div className="text-xs">{eventInfo.event.extendedProps.venue}</div>
              </div>
            )}
            height="100%"
          />
        </div>
      </Card>
    </div>
  )
} 