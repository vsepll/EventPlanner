"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calendar, 
  MapPin, 
  Users2, 
  Ticket, 
  Users, 
  MessageSquare, 
  QrCode, 
  Download, 
  Info, 
  KeyRound,
  BarChart3,
  ChevronLeft
} from "lucide-react"
import { useEvent } from "@/contexts/EventContext"
import { BasicInfoForm } from "@/components/BasicInfoForm"
import { TicketingForm } from "@/components/TicketingForm"
import { StaffManagementForm } from "@/components/StaffManagementForm"
import { CommunicationForm } from "@/components/CommunicationForm"
import { AccessControlForm } from "@/components/AccessControlForm"
import { EventFinancialDashboard } from "@/components/EventFinancialDashboard"
import { Button } from "@/components/ui/button"
import { generateEventPDF } from "@/lib/generateEventPDF"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import Link from "next/link"

export function EventDashboard({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { event, isLoading, error } = useEvent()
  const [activeTab, setActiveTab] = useState("basic-info")

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (error || !event) {
    return <div>Error: {error || "No se pudo cargar el evento"}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4 px-6">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver a Eventos
            </Button>
          </Link>
          <Button 
            variant="outline"
            onClick={() => generateEventPDF(event)}
            className="h-8 px-3 text-sm gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Exportar PDF
          </Button>
        </div>

        <div className="grid gap-4 px-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{event.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="mr-2">
                {event.type}
              </Badge>
              <span className="inline-flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-gray-400" />
                {format(new Date(event.date), "PPP", { locale: es })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        defaultValue="basic-info"
        className="space-y-6"
      >
        <div className="px-6">
          <TabsList className="w-fit">
            <TabsTrigger value="basic-info">
              <Info className="h-3.5 w-3.5" />
              Información Básica
            </TabsTrigger>
            <TabsTrigger value="ticketing">
              <Ticket className="h-3.5 w-3.5" />
              Boletería
            </TabsTrigger>
            <TabsTrigger value="staff">
              <Users2 className="h-3.5 w-3.5" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="access-control">
              <KeyRound className="h-3.5 w-3.5" />
              Control de Accesos
            </TabsTrigger>
            <TabsTrigger value="financial">
              <BarChart3 className="h-3.5 w-3.5" />
              Finanzas
            </TabsTrigger>
          </TabsList>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          key={activeTab}
          className="px-6"
        >
          <TabsContent value="basic-info" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Información Básica</CardTitle>
                <CardDescription>
                  Información general del evento y detalles del contrato.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ticketing" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Boletería</CardTitle>
                <CardDescription>
                  Configura los puntos de venta y políticas de boletería.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketingForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Personal</CardTitle>
                <CardDescription>
                  Administra el personal asignado al evento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaffManagementForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access-control" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Control de Accesos</CardTitle>
                <CardDescription>
                  Configura el sistema de control de accesos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AccessControlForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Financiero</CardTitle>
                <CardDescription>
                  Análisis financiero y proyecciones del evento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventFinancialDashboard event={event} />
              </CardContent>
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  )
}

