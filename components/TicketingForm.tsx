"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid'
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEvent } from "@/contexts/EventContext"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"

const boxOfficeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  location: z.string().min(1, "La ubicación es requerida"),
  schedule: z.object({
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().min(1, "La fecha de fin es requerida"),
    operatingHours: z.object({
      start: z.string(),
      end: z.string(),
    }),
  }),
  staff: z.object({
    ticketSellers: z.number().min(0),
    supervisors: z.number().min(0),
  }),
})

const formSchema = z.object({
  saleMode: z.enum(["online", "hybrid", "physical"]),
  boxOffices: z.array(boxOfficeSchema),
  salesProjection: z.object({
    estimatedTickets: z.number().min(0),
    averageTicketPrice: z.number().min(0),
    costs: z.object({
      ticketing: z.number().min(0),
      accommodation: z.number().min(0),
      fuel: z.number().min(0),
      accessControl: z.number().min(0),
    }),
    totalRevenue: z.number().min(0),
    totalCosts: z.number().min(0),
    projectedProfit: z.number().min(0),
  }),
})

export function TicketingForm() {
  const { event, dispatch, updateEventData } = useEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      saleMode: event?.ticketing?.saleMode || "online",
      boxOffices: event?.ticketing?.boxOffices || [],
      salesProjection: {
        estimatedTickets: event?.salesProjection?.estimatedTickets || 0,
        averageTicketPrice: event?.salesProjection?.averageTicketPrice || 0,
        costs: {
          ticketing: event?.salesProjection?.costs?.ticketing || 0,
          accommodation: event?.salesProjection?.costs?.accommodation || 0,
          fuel: event?.salesProjection?.costs?.fuel || 0,
          accessControl: event?.salesProjection?.costs?.accessControl || 0,
        },
        totalRevenue: event?.salesProjection?.totalRevenue || 0,
        totalCosts: event?.salesProjection?.totalCosts || 0,
        projectedProfit: event?.salesProjection?.projectedProfit || 0,
      },
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "boxOffices",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Calcular los totales
      const estimatedTickets = Number(values.salesProjection.estimatedTickets)
      const averageTicketPrice = Number(values.salesProjection.averageTicketPrice)
      const costs = {
        ticketing: Number(values.salesProjection.costs.ticketing),
        accommodation: Number(values.salesProjection.costs.accommodation),
        fuel: Number(values.salesProjection.costs.fuel),
        accessControl: Number(values.salesProjection.costs.accessControl),
      }
      
      const totalRevenue = estimatedTickets * averageTicketPrice
      const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0)
      const projectedProfit = totalRevenue - totalCosts

      const salesProjectionWithTotals = {
        estimatedTickets,
        averageTicketPrice,
        costs,
        totalRevenue,
        totalCosts,
        projectedProfit,
      }

      // Actualizar el estado local
      dispatch({
        type: "UPDATE_TICKETING",
        payload: {
          saleMode: values.saleMode,
          boxOffices: values.boxOffices,
        },
      })

      dispatch({
        type: "UPDATE_SALES_PROJECTION",
        payload: salesProjectionWithTotals,
      })

      // Guardar en el servidor
      await updateEventData({
        ticketing: {
          saleMode: values.saleMode,
          boxOffices: values.boxOffices,
        },
        salesProjection: salesProjectionWithTotals,
      })

      toast({
        title: "Configuración guardada",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la configuración:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addBoxOffice = () => {
    append({
      id: uuidv4(),
      name: "",
      location: "",
      schedule: {
        startDate: "",
        endDate: "",
        operatingHours: {
          start: "09:00",
          end: "18:00",
        },
      },
      staff: {
        ticketSellers: 0,
        supervisors: 0,
      },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="saleMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modalidad de Venta</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la modalidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="online">Solo Online</SelectItem>
                  <SelectItem value="physical">Solo Boletería Física</SelectItem>
                  <SelectItem value="hybrid">Híbrida (Online + Boletería)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Selecciona la modalidad de venta de tickets
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch("saleMode") !== "online" && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium">Boleterías</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBoxOffice}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Agregar Boletería
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-medium">Boletería {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Boletería Principal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.location`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Entrada Principal del Estadio" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.schedule.startDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Inicio</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.schedule.endDate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Fin</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.schedule.operatingHours.start`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario de Apertura</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.schedule.operatingHours.end`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horario de Cierre</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.staff.ticketSellers`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad de Boleteros</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`boxOffices.${index}.staff.supervisors`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cantidad de Supervisores</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Previsión de Ventas</h3>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="salesProjection.estimatedTickets"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad Total de Tickets</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        step="1"
                        {...field} 
                        value={field.value || ""}
                        onChange={e => {
                          const value = e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salesProjection.averageTicketPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio Promedio del Ticket</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        step="0.01"
                        {...field} 
                        value={field.value || ""}
                        onChange={e => {
                          const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h4 className="font-medium">Costos Operativos</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="salesProjection.costs.ticketing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costos de Boletería</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          {...field} 
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesProjection.costs.accommodation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costos de Hospedaje</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          {...field} 
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesProjection.costs.fuel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costos de Combustible</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          {...field} 
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salesProjection.costs.accessControl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costos de Control de Accesos</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="0.01"
                          {...field} 
                          value={field.value || ""}
                          onChange={e => {
                            const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
                            field.onChange(value)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="space-y-2">
              <h4 className="font-medium">Resumen Financiero</h4>
              <div className="text-sm space-y-1">
                <div>Ingresos Estimados: ${form.watch("salesProjection.estimatedTickets") * form.watch("salesProjection.averageTicketPrice")}</div>
                <div>Costos Totales: ${Object.values(form.watch("salesProjection.costs")).reduce((a, b) => a + b, 0)}</div>
                <div className="font-medium">
                  Beneficio Proyectado: ${
                    (form.watch("salesProjection.estimatedTickets") * form.watch("salesProjection.averageTicketPrice")) -
                    Object.values(form.watch("salesProjection.costs")).reduce((a, b) => a + b, 0)
                  }
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Form>
  )
}

