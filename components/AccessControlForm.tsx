"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { useEvent } from "@/contexts/EventContext"
import { useToast } from "@/components/ui/use-toast"
import { useState, useEffect } from "react"

const formSchema = z.object({
  method: z.enum(["app", "external"]),
  equipment: z.object({
    quantity: z.number().min(0),
    type: z.enum(["we_rent", "we_rent_out", "owned"]),
    quoted: z.boolean(),
    cost: z.number().optional(),
  }),
  staff: z.object({
    quantity: z.number().min(0),
  }),
  internet: z.enum(["organizer", "own"]),
})

export function AccessControlForm() {
  const { event, updateEventData } = useEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: event?.accessControl?.method || "app",
      equipment: {
        quantity: event?.accessControl?.equipment?.quantity || 0,
        type: (event?.accessControl?.equipment?.type || "we_rent") as "we_rent" | "we_rent_out" | "owned",
        quoted: event?.accessControl?.equipment?.quoted || false,
        cost: event?.accessControl?.equipment?.cost || 0,
      },
      staff: {
        quantity: event?.accessControl?.staff?.quantity || 0,
      },
      internet: (event?.accessControl?.internet || "organizer") as "organizer" | "own",
    },
  })

  // Actualizar el formulario cuando cambian los datos del evento
  useEffect(() => {
    if (event?.accessControl) {
      const defaultEquipment = {
        quantity: 0,
        type: "we_rent" as const,
        quoted: false,
        cost: 0
      }

      const equipment = event.accessControl.equipment || defaultEquipment

      form.reset({
        method: event.accessControl.method || "app",
        equipment: {
          quantity: equipment.quantity || 0,
          type: (equipment.type || "we_rent") as "we_rent" | "we_rent_out" | "owned",
          quoted: equipment.quoted || false,
          cost: equipment.cost || 0,
        },
        staff: {
          quantity: event.accessControl.staff?.quantity || 0,
        },
        internet: (event.accessControl.internet || "organizer") as "organizer" | "own",
      })
    }
  }, [event, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)

      // Transformar los datos al formato esperado por el servidor
      const accessControlData = {
        method: values.method,
        equipment: {
          quantity: values.equipment.quantity,
          type: values.equipment.type,
          quoted: values.equipment.quoted,
          cost: values.equipment.cost,
        },
        staff: {
          quantity: values.staff.quantity,
        },
        internet: values.internet,
      }

      // Guardar en el servidor
      await updateEventData({
        accessControl: accessControlData,
      })

      // Mantener el formulario con los valores actualizados
      form.reset(values, {
        keepValues: true,
        keepDirty: false,
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

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(onSubmit)(e);
      }} className="space-y-8">
        <Card className="p-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Control de Accesos</FormLabel>
                  <Select 
                    onValueChange={(value: "app" | "external") => {
                      field.onChange(value);
                      form.setValue("method", value, { shouldDirty: true });
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el método" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="app">App Propia</SelectItem>
                      <SelectItem value="external">Proveedor Externo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona el método de control de accesos a utilizar
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium">Equipamiento</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="equipment.quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad de Equipos</FormLabel>
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
                  name="equipment.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Equipamiento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch("method") === "app" ? (
                            <>
                              <SelectItem value="we_rent">Alquilamos</SelectItem>
                              <SelectItem value="owned">Propio</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="we_rent_out">Damos en Alquiler</SelectItem>
                              <SelectItem value="owned">Propio</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center space-x-2">
                <FormField
                  control={form.control}
                  name="equipment.quoted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Cotizado
                        </FormLabel>
                        <FormDescription>
                          Indica si ya se ha realizado la cotización del equipamiento
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("equipment.quoted") && (
                <FormField
                  control={form.control}
                  name="equipment.cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Costo del Equipamiento</FormLabel>
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
              )}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Personal</h4>
              <FormField
                control={form.control}
                name="staff.quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad de Personal</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Número total de personas necesarias para el control de accesos
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="internet"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conexión a Internet</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="organizer">Organizador</SelectItem>
                      <SelectItem value="own">Propia</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecciona quién proveerá la conexión a internet
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </form>
    </Form>
  )
}

