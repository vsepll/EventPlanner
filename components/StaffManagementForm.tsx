"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useFieldArray, useForm } from "react-hook-form"
import * as z from "zod"
import { v4 as uuidv4 } from 'uuid'

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useEvent } from "@/contexts/EventContext"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, User, Mail, Briefcase } from "lucide-react"
import { useState } from "react"

const staffMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  role: z.string().min(2, "El rol debe tener al menos 2 caracteres"),
  email: z.string().email("Debe ser un email válido"),
})

const formSchema = z.object({
  staffMembers: z.array(staffMemberSchema).min(1, "Debe haber al menos un miembro del personal"),
})

export function StaffManagementForm() {
  const { event, dispatch, updateEventData } = useEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      staffMembers: event?.accessControl?.staff?.assigned || [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "staffMembers",
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Actualizar el estado local
      dispatch({
        type: "UPDATE_EVENT",
        payload: { 
          accessControl: {
            ...event?.accessControl,
            staff: {
              quantity: event?.accessControl?.staff?.quantity || 0,
              assigned: values.staffMembers,
            },
          },
        },
      })

      // Guardar en el servidor
      await updateEventData({
        accessControl: {
          ...event?.accessControl,
          staff: {
            quantity: event?.accessControl?.staff?.quantity || 0,
            assigned: values.staffMembers,
          },
        },
      })

      toast({
        title: "Personal actualizado",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el personal",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addStaffMember = () => {
    append({
      id: uuidv4(),
      name: "",
      role: "",
      email: "",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Personal del Evento</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStaffMember}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Personal
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 relative group">
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <FormField
                    control={form.control}
                    name={`staffMembers.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Nombre"
                            className="h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-2">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <FormField
                    control={form.control}
                    name={`staffMembers.${index}.role`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Rol"
                            className="h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-muted rounded-full p-2">
                    <Mail className="h-4 w-4" />
                  </div>
                  <FormField
                    control={form.control}
                    name={`staffMembers.${index}.email`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="Email"
                            className="h-8"
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

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Personal"}
        </Button>
      </form>
    </Form>
  )
}

