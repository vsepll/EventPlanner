"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createEvent } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

const EVENT_TYPES = [
  { value: "deportivo", label: "Evento Deportivo" },
  { value: "festival", label: "Festival" },
  { value: "teatro", label: "Teatro" },
  { value: "conferencia", label: "Conferencia" },
] as const

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  type: z.enum(EVENT_TYPES.map(t => t.value) as [string, ...string[]]),
  date: z.string().min(1, "La fecha es requerida"),
  venue: z.string().min(1, "El lugar es requerido"),
  salesProjection: z.object({
    onlineTickets: z.number().min(0),
    boxOfficeTickets: z.number().min(0),
  }),
})

export default function NewEventPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: EVENT_TYPES[0].value,
      date: "",
      venue: "",
      salesProjection: {
        onlineTickets: 0,
        boxOfficeTickets: 0,
      },
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null)
    setIsSubmitting(true)
    
    try {
      const event = await createEvent(values)
      toast({
        title: "¡Evento creado!",
        description: "El evento se ha creado exitosamente.",
      })
      if (event && event.id) {
        router.push(`/events/${event.id}`)
      } else {
        throw new Error("No se recibió el ID del evento creado")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el evento")
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Error al crear el evento",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nuevo Evento</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Concierto de Rock" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Evento</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo de evento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lugar</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Estadio Nacional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesProjection.onlineTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tickets Online Esperados</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesProjection.boxOfficeTickets"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tickets en Taquilla Esperados</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creando..." : "Crear Evento"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 