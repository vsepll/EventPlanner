import { Event } from "@/types/event"
import { v4 as uuidv4 } from "uuid"
import { addDays, addMonths, addWeeks, addYears, format } from "date-fns"

export function duplicateEvent(event: Event, userId: string, userName: string): Event {
  const now = new Date()
  const newEvent: Event = {
    ...event,
    id: uuidv4(),
    name: `${event.name} (Copia)`,
    originalEventId: event.id,
    status: "draft",
    progress: 0,
    changeLogs: [{
      id: uuidv4(),
      eventId: event.id,
      action: "duplicate",
      timestamp: now.toISOString(),
      userId,
      userName
    }]
  }

  delete newEvent.calendarIntegrations
  return newEvent
}

export function generateRecurringEvents(
  baseEvent: Event,
  userId: string,
  userName: string
): Event[] {
  if (!baseEvent.recurringConfig) return [baseEvent]

  const events: Event[] = []
  const {
    frequency,
    interval,
    endDate,
    daysOfWeek
  } = baseEvent.recurringConfig

  let currentDate = new Date(baseEvent.date)
  const endDateTime = endDate ? new Date(endDate) : null

  while (!endDateTime || currentDate <= endDateTime) {
    // Skip if day of week doesn't match for weekly recurrence
    if (frequency === "weekly" && daysOfWeek?.length) {
      const currentDayOfWeek = currentDate.getDay()
      if (!daysOfWeek.includes(currentDayOfWeek)) {
        currentDate = addDays(currentDate, 1)
        continue
      }
    }

    const event = duplicateEvent(baseEvent, userId, userName)
    event.date = format(currentDate, "yyyy-MM-dd")
    events.push(event)

    // Increment date based on frequency
    switch (frequency) {
      case "daily":
        currentDate = addDays(currentDate, interval)
        break
      case "weekly":
        currentDate = addWeeks(currentDate, interval)
        break
      case "monthly":
        currentDate = addMonths(currentDate, interval)
        break
      case "yearly":
        currentDate = addYears(currentDate, interval)
        break
    }
  }

  return events
}

export function generateChangeLog(
  event: Event,
  action: "create" | "update" | "delete" | "duplicate",
  userId: string,
  userName: string,
  field?: string,
  oldValue?: any,
  newValue?: any
) {
  return {
    id: uuidv4(),
    eventId: event.id,
    action,
    field,
    oldValue,
    newValue,
    timestamp: new Date().toISOString(),
    userId,
    userName
  }
} 