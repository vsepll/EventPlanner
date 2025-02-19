"use client"

import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Users2, MapPin, Plus, DollarSign, Download, Trash2, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { deleteEvent } from "@/lib/api"
import { Event } from "@/types/event"
import { generateEventPDF } from "@/lib/generateEventPDF"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState, memo, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

interface EventListProps {
  events: Event[]
  isLoading: boolean
  onViewChange: () => void
}

// Utility functions
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return '$0'
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(value)
}

const formatNumber = (value: number | undefined) => {
  if (value === undefined) return '0'
  return value.toLocaleString()
}

// Animation variants
const motionVariants = {
  item: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  },
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }
}

const EventCard = memo(({ event, onDelete, onExport }: { 
  event: Event, 
  onDelete: (event: Event) => void,
  onExport: (event: Event, e: React.MouseEvent) => void 
}) => (
  <motion.div variants={motionVariants.item}>
    <Link href={`/events/${event.id}`}>
      <Card className="group h-full hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{event.name}</CardTitle>
              <CardDescription className="mt-1">
                <Badge variant="secondary" className="capitalize">
                  {event.type}
                </Badge>
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={(e) => {
                e.preventDefault()
                onDelete(event)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span className="text-sm">{format(new Date(event.date), "PPP", { locale: es })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{event.venue}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-muted/10 rounded-lg p-3 border border-border/50">
                <div className="text-sm font-medium mb-1">Asistentes</div>
                <div className="text-2xl font-bold">
                  {formatNumber(event.salesProjection?.estimatedTickets)}
                </div>
              </div>
              <div className="bg-muted/10 rounded-lg p-3 border border-border/50">
                <div className="text-sm font-medium mb-1">Beneficio</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(event.salesProjection?.projectedProfit)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-6">
          <div className="flex justify-between items-center w-full">
            <Button 
              variant="outline" 
              size="sm"
              onClick={(e) => onExport(event, e)}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="group-hover:translate-x-1 transition-transform"
            >
              Ver Detalles
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  </motion.div>
))

EventCard.displayName = 'EventCard'

export const EventList = memo(({ events, isLoading, onViewChange }: EventListProps) => {
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null)
  const { toast } = useToast()

  const handleExport = useCallback((event: Event, e: React.MouseEvent) => {
    e.preventDefault()
    generateEventPDF(event)
  }, [])

  const handleDelete = useCallback(async (confirmed: boolean) => {
    if (!confirmed || !eventToDelete) {
      setEventToDelete(null)
      return
    }

    try {
      await deleteEvent(eventToDelete.id)
      toast({
        title: "Evento eliminado",
        description: "El evento se ha eliminado correctamente",
      })
      window.location.reload()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el evento",
      })
    } finally {
      setEventToDelete(null)
    }
  }, [eventToDelete, toast])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <motion.div 
        variants={motionVariants.container}
        initial="hidden"
        animate="show"
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        <motion.div variants={motionVariants.item}>
          <Link href="/events/new" className="block h-full">
            <Card className="group h-full bg-primary/5 border-dashed hover:bg-primary/10 transition-all hover:shadow-lg cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-center h-full">
                <div className="text-center">
                  <div className="rounded-full bg-primary/10 p-3 mb-4 mx-auto w-fit group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-medium">Crear Nuevo Evento</CardTitle>
                  <CardDescription>Comienza la planificación</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </motion.div>

        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onDelete={setEventToDelete} 
            onExport={handleExport} 
          />
        ))}
      </motion.div>

      <AlertDialog open={!!eventToDelete} onOpenChange={() => setEventToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el evento
              {eventToDelete && <span className="font-medium"> "{eventToDelete.name}"</span>} y
              toda su información asociada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleDelete(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => handleDelete(true)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

EventList.displayName = 'EventList'

