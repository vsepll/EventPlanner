"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useEvent } from "@/contexts/EventContext"
import { useToast } from "@/components/ui/use-toast"
import { Event, EventType } from "@/types/event"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const EVENT_TYPES = [
  { value: "festival", label: "Festival" },
  { value: "sports", label: "Evento Deportivo" },
  { value: "conference", label: "Conferencia" },
  { value: "party", label: "Fiesta" },
  { value: "other", label: "Otro" },
] as const

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  type: z.enum(EVENT_TYPES.map(t => t.value) as [string, ...string[]]),
  date: z.string().min(1, "La fecha es requerida"),
  venue: z.string().min(2, "El lugar es requerido"),
  contract: z.object({
    signed: z.boolean(),
    documentUrl: z.string().optional(),
    documentName: z.string().optional(),
  }),
  previousExperience: z.object({
    exists: z.boolean(),
    details: z.object({
      ticketing: z.string().optional(),
      accessControl: z.string().optional(),
      general: z.string().optional(),
    }),
  }),
  mainContact: z.object({
    id: z.string().uuid(),
    name: z.string().min(2, "El nombre es requerido"),
    email: z.string().email("Email inválido"),
    phone: z.string().min(6, "Teléfono inválido"),
    role: z.string().min(2, "El rol es requerido"),
  }),
})

export function BasicInfoForm() {
  const { event, updateEventData } = useEvent()
  const [contractFile, setContractFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: event?.name || "",
      type: event?.type || "festival",
      date: event?.date ? new Date(event.date).toISOString().split('T')[0] : "",
      venue: event?.venue || "",
      contract: {
        signed: event?.contract?.signed || false,
        documentUrl: event?.contract?.documentUrl || "",
        documentName: event?.contract?.documentName || "",
      },
      previousExperience: {
        exists: false,
        details: {
          ticketing: event?.previousExperience?.details?.ticketing || "",
          accessControl: event?.previousExperience?.details?.accessControl || "",
          general: event?.previousExperience?.details?.general || "",
        },
      },
      mainContact: {
        id: event?.mainContact?.id || uuidv4(),
        name: event?.mainContact?.name || "",
        email: event?.mainContact?.email || "",
        phone: event?.mainContact?.phone || "",
        role: event?.mainContact?.role || "",
      },
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Error",
          description: "Solo se permiten archivos PDF",
          variant: "destructive",
        })
        return
      }
      setContractFile(file)
      form.setValue("contract.documentName", file.name)
    }
  }

  const uploadContract = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/events/${event?.id}/contract`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Error al subir el archivo: ${response.status}`)
      }

      const data = await response.json()
      form.setValue("contract.documentUrl", data.documentUrl)
      form.setValue("contract.documentName", data.documentName)

      toast({
        title: "Éxito",
        description: "Contrato subido correctamente",
      })
    } catch (error) {
      console.error("Error detallado:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el contrato",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleDownload = () => {
    const documentUrl = form.getValues("contract.documentUrl")
    if (documentUrl) {
      window.open(documentUrl, "_blank")
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>, e: React.FormEvent) {
    e.preventDefault()
    try {
      setIsUploading(true)
      
      const updateData = {
        name: values.name,
        type: values.type as EventType,
        date: values.date,
        venue: values.venue,
        contract: values.contract,
        previousExperience: values.previousExperience,
        mainContact: values.mainContact,
      }

      if (contractFile) {
        const formData = new FormData()
        formData.append("file", contractFile)
        
        try {
          const response = await fetch(`/api/events/${event?.id}/contract`, {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Error al subir el archivo: ${response.status}`)
          }

          const data = await response.json()
          updateData.contract = {
            ...updateData.contract,
            documentUrl: data.documentUrl,
            documentName: data.documentName,
          }
        } catch (error) {
          console.error("Error al subir contrato:", error)
          toast({
            title: "Error",
            description: error instanceof Error ? error.message : "Error al subir el contrato",
            variant: "destructive",
          })
          return
        }
      }

      await updateEventData(updateData)
      setContractFile(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al guardar la información",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => form.handleSubmit((values) => onSubmit(values, e))(e)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Evento</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Contrato</h3>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="contract.signed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Contrato Firmado</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Documento del Contrato</FormLabel>
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer"
                disabled={isUploading}
              />
              <FormDescription>
                Sube el contrato en formato PDF
              </FormDescription>
            </div>

            {form.watch("contract.documentName") && (
              <div className="flex items-center gap-2">
                <span className="text-sm">{form.watch("contract.documentName")}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!form.watch("contract.documentUrl")}
                >
                  Descargar
                </Button>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="previousExperience.exists"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Experiencia Previa</FormLabel>
                </div>
              </FormItem>
            )}
          />

          {form.watch("previousExperience.exists") && (
            <Card className="p-6">
              <Tabs defaultValue="ticketing" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ticketing">Boletería</TabsTrigger>
                  <TabsTrigger value="accessControl">Control de Accesos</TabsTrigger>
                  <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="ticketing">
                  <FormField
                    control={form.control}
                    name="previousExperience.details.ticketing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiencia en Boletería</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe la experiencia previa en manejo de boletería..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="accessControl">
                  <FormField
                    control={form.control}
                    name="previousExperience.details.accessControl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiencia en Control de Accesos</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe la experiencia previa en control de accesos..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="general">
                  <FormField
                    control={form.control}
                    name="previousExperience.details.general"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experiencia General</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe la experiencia general en eventos similares..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contacto Principal</h3>
          
          <FormField
            control={form.control}
            name="mainContact.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainContact.email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainContact.phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl>
                  <Input type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mainContact.role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rol</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Guardando..." : "Guardar Información"}
        </Button>
      </form>
    </Form>
  )
}

