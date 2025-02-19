"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEvent } from "@/contexts/EventContext"

const formSchema = z.object({
  socialMedia: z.object({
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),
  promotionalMaterials: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      status: z.enum(["pending", "in_progress", "completed"]),
    }),
  ),
  pressRelease: z.string(),
})

export function CommunicationForm() {
  const { event, dispatch, updateEventData } = useEvent()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      socialMedia: event?.communication?.socialMedia || {},
      promotionalMaterials: event?.communication?.promotionalMaterials || [],
      pressRelease: event?.communication?.pressRelease || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      
      // Actualizar el estado local
      dispatch({
        type: "UPDATE_EVENT",
        payload: { communication: values },
      })

      // Guardar en el servidor
      await updateEventData({
        communication: values,
      })

      toast({
        title: "Comunicación guardada",
        description: "Los cambios se han guardado correctamente",
      })
    } catch (error) {
      console.error("Error al guardar la comunicación:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la comunicación",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Redes Sociales</h3>
          <FormField
            control={form.control}
            name="socialMedia.facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facebook</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://facebook.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="socialMedia.instagram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instagram</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://instagram.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="socialMedia.twitter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Twitter</FormLabel>
                <FormControl>
                  <Input {...field} type="url" placeholder="https://twitter.com/..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Materiales Promocionales</h3>
          {/* Aquí podrías agregar un componente para manejar una lista dinámica de materiales promocionales */}
        </div>

        <FormField
          control={form.control}
          name="pressRelease"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comunicado de Prensa</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Escribe el comunicado de prensa aquí..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Comunicación"}
        </Button>
      </form>
    </Form>
  )
}

