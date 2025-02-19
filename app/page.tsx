"use client"

import { EventList } from "@/components/EventList"
import { CalendarView } from "@/components/CalendarView"
import { FinancialDashboard } from "@/components/FinancialDashboard"
import { useState, useEffect, useRef } from "react"
import { getEvents } from "@/lib/api"
import { Event } from "@/types/event"
import { Button } from "@/components/ui/button"
import { BarChart3, Calendar, List, Plus, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

type ViewType = 'list' | 'calendar' | 'financial'

export default function Home() {
  const [viewType, setViewType] = useState<ViewType>('list')
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    loadEvents()

    // Manejar el cambio de vista desde la navegación
    const handleViewChange = (event: CustomEvent<{ view: ViewType }>) => {
      handleViewChangeWithScroll(event.detail.view)
    }

    window.addEventListener('changeView', handleViewChange as EventListener)
    
    // Manejar vista inicial desde URL
    const viewParam = searchParams.get('view')
    if (viewParam) {
      handleViewChangeWithScroll(viewParam as ViewType)
    }

    return () => {
      window.removeEventListener('changeView', handleViewChange as EventListener)
    }
  }, [])

  useEffect(() => {
    if (mainContentRef.current) {
      const yOffset = -80 // Ajuste para considerar el header fijo
      const element = mainContentRef.current
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
    }
  }, [viewType])

  async function loadEvents() {
    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los eventos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewChangeWithScroll = (type: ViewType) => {
    setViewType(type)
  }

  if (error) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-destructive mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full py-12 md:py-24 lg:py-32 overflow-hidden">
        {/* Video de fondo */}
        <div className="absolute inset-0 w-full h-full">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src="/Timeline 1.mp4"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenido */}
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
              Gestiona tus eventos con facilidad
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
              Planifica, organiza y analiza tus eventos en una sola plataforma.
            </p>
            <div className="space-x-4 mt-8">
              <Link href="/events/new">
                <Button size="lg" className="h-11 px-8 bg-white text-black hover:bg-white/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Evento
                </Button>
              </Link>
              <Button 
                variant="default" 
                size="lg"
                className="h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90" 
                onClick={() => handleViewChangeWithScroll('calendar')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Ver Calendario
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full py-12 bg-muted/50" ref={mainContentRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">
                  {viewType === 'list' && "Eventos Recientes"}
                  {viewType === 'calendar' && "Calendario de Eventos"}
                  {viewType === 'financial' && "Dashboard Financiero"}
                </h2>
                <p className="text-muted-foreground">
                  {viewType === 'list' && "Gestiona y visualiza tus próximos eventos"}
                  {viewType === 'calendar' && "Vista mensual de todos tus eventos"}
                  {viewType === 'financial' && "Análisis financiero de tus eventos"}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewType === 'list' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChangeWithScroll('list')}
                >
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </Button>
                <Button
                  variant={viewType === 'calendar' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChangeWithScroll('calendar')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendario
                </Button>
                <Button
                  variant={viewType === 'financial' ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleViewChangeWithScroll('financial')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Finanzas
                </Button>
              </div>
            </div>

            <div className="mt-6">
              {viewType === 'list' && (
                <EventList 
                  events={events} 
                  isLoading={isLoading} 
                  onViewChange={() => handleViewChangeWithScroll('calendar')} 
                />
              )}
              
              {viewType === 'calendar' && (
                <CalendarView 
                  events={events} 
                  onViewChange={() => handleViewChangeWithScroll('list')} 
                />
              )}

              {viewType === 'financial' && (
                <FinancialDashboard events={events} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="w-full py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Crear Nuevo Evento</CardTitle>
                <CardDescription>Comienza a planificar tu próximo evento</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/events/new">
                  <Button className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Evento
                  </Button>
                </Link>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Análisis Financiero</CardTitle>
                <CardDescription>Revisa el rendimiento de tus eventos</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleViewChangeWithScroll('financial')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Ver Análisis
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Vista Calendario</CardTitle>
                <CardDescription>Visualiza todos tus eventos programados</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleViewChangeWithScroll('calendar')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Ver Calendario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
