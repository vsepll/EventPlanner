import { Event, EventFormData } from "@/types/event"
import { cache, getCachedEvent, setCachedEvent, getCachedEventList, setCachedEventList, invalidateEventCache } from "./cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function getEvents(): Promise<Event[]> {
  try {
    // Check cache first
    const cachedEvents = getCachedEventList()
    if (cachedEvents) {
      return cachedEvents
    }

    const response = await fetch(`${API_URL}/events`)
    if (!response.ok) {
      throw new Error('Error al obtener los eventos')
    }
    const events = await response.json()
    
    // Cache the results
    setCachedEventList(events)
    return events
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

export async function getEvent(id: string): Promise<Event> {
  try {
    // Check cache first
    const cachedEvent = getCachedEvent(id)
    if (cachedEvent) {
      return cachedEvent
    }

    const response = await fetch(`${API_URL}/events/${id}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener el evento')
    }
    
    // Cache the result
    setCachedEvent(data)
    return data
  } catch (error) {
    console.error(`Error fetching event ${id}:`, error)
    throw error
  }
}

export async function createEvent(eventData: EventFormData): Promise<Event> {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    if (!response.ok) {
      throw new Error('Error al crear el evento')
    }

    const event = await response.json()
    
    // Invalidate the events list cache
    invalidateEventCache('list')
    return event
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

export async function updateEvent(id: string, eventData: Partial<EventFormData>): Promise<Event> {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })
    
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar el evento')
    }

    // Invalidate both the specific event and the list cache
    invalidateEventCache(id)
    invalidateEventCache('list')
    return data
  } catch (error) {
    console.error(`Error updating event ${id}:`, error)
    throw error
  }
}

export async function deleteEvent(id: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      throw new Error('Error al eliminar el evento')
    }

    // Invalidate both the specific event and the list cache
    invalidateEventCache(id)
  } catch (error) {
    console.error(`Error deleting event ${id}:`, error)
    throw error
  }
}

// Función para precargar datos
export async function preloadEventData(id: string): Promise<void> {
  try {
    const event = await getEvent(id)
    setCachedEvent(event)
  } catch (error) {
    console.error(`Error preloading event ${id}:`, error)
  }
}

// Función para precargar lista de eventos
export async function preloadEventList(): Promise<void> {
  try {
    const events = await getEvents()
    setCachedEventList(events)
  } catch (error) {
    console.error('Error preloading event list:', error)
  }
}

