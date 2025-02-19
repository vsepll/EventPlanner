"use client"

import React, { createContext, useContext, useEffect, useReducer, useCallback } from "react"
import { getEvent, updateEvent } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Event, SalesProjection, TicketingConfig } from "@/types/event"

type EventState = {
  event: Event | null
  isLoading: boolean
  error: string | null
}

type EventAction = 
  | { type: "SET_EVENT"; payload: Event }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_SALES_PROJECTION"; payload: SalesProjection }
  | { type: "UPDATE_TICKETING"; payload: TicketingConfig }
  | { type: "UPDATE_EVENT"; payload: Partial<Event> }

const initialState: EventState = {
  event: null,
  isLoading: true,
  error: null,
}

function eventReducer(state: EventState, action: EventAction): EventState {
  switch (action.type) {
    case "SET_EVENT":
      return { ...state, event: action.payload, error: null }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    case "UPDATE_SALES_PROJECTION":
      if (!state.event) return state
      return {
        ...state,
        event: {
          ...state.event,
          salesProjection: action.payload,
        },
      }
    case "UPDATE_TICKETING":
      if (!state.event) return state
      return {
        ...state,
        event: {
          ...state.event,
          ticketing: action.payload,
        },
      }
    case "UPDATE_EVENT":
      if (!state.event) return state
      return {
        ...state,
        event: {
          ...state.event,
          ...action.payload,
          ...(action.payload.salesProjection ? { 
            salesProjection: { 
              ...state.event.salesProjection, 
              ...action.payload.salesProjection 
            } 
          } : {}),
          ...(action.payload.ticketing ? { 
            ticketing: { 
              ...state.event.ticketing, 
              ...action.payload.ticketing 
            } 
          } : {}),
          ...(action.payload.accessControl ? { 
            accessControl: { 
              ...state.event.accessControl, 
              ...action.payload.accessControl 
            } 
          } : {}),
        },
      }
    default:
      return state
  }
}

interface EventContextType extends EventState {
  dispatch: React.Dispatch<EventAction>
  updateEventData: (data: Partial<Event>) => Promise<void>
}

const EventContext = createContext<EventContextType>({
  ...initialState,
  dispatch: () => {},
  updateEventData: async () => {},
})

export function EventProvider({
  children,
  eventId,
}: {
  children: React.ReactNode
  eventId: string
}) {
  const [state, dispatch] = useReducer(eventReducer, initialState)
  const { toast } = useToast()

  const loadEvent = useCallback(async () => {
    if (!eventId) return

    try {
      dispatch({ type: "SET_LOADING", payload: true })
      dispatch({ type: "SET_ERROR", payload: null })
      const data = await getEvent(eventId)
      if (data) {
        dispatch({ type: "SET_EVENT", payload: data })
      } else {
        dispatch({ type: "SET_ERROR", payload: "No se encontró el evento" })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al cargar el evento"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [eventId, toast])

  const updateEventData = useCallback(async (data: Partial<Event>) => {
    if (!state.event?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se encontró el evento para actualizar",
      })
      return
    }

    dispatch({
      type: "UPDATE_EVENT",
      payload: data,
    })

    try {
      const updatedEvent = await updateEvent(state.event.id, data)
      
      if (updatedEvent) {
        dispatch({ type: "SET_EVENT", payload: updatedEvent })
        toast({
          title: "¡Actualizado!",
          description: "Los cambios se han guardado correctamente",
        })
      } else {
        throw new Error("No se pudo actualizar el evento")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar el evento"
      toast({
        variant: "destructive",
        title: "Error de sincronización",
        description: "Los cambios se guardaron localmente pero hubo un error al sincronizar con el servidor",
      })
      console.error("Error de sincronización:", errorMessage)
    }
  }, [state.event?.id, toast])

  useEffect(() => {
    if (eventId) {
      loadEvent()
    }
  }, [eventId, loadEvent])

  return (
    <EventContext.Provider value={{ ...state, dispatch, updateEventData }}>
      {children}
    </EventContext.Provider>
  )
}

export function useEvent() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEvent debe usarse dentro de un EventProvider")
  }
  return context
}

