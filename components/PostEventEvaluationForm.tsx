"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useEvent } from "@/contexts/EventContext"

const formSchema = z.object({
  financialReport: z.object({
    totalRevenue: z.number(),
    totalExpenses: z.number(),
    netProfit: z.number(),
  }),
  attendanceCount: z.number(),
  surveyResults: z.object({
    overallSatisfaction: z.number().min(1).max(10),
    communicationRating: z.number().min(1).max(10),
    venueRating: z.number().min(1).max(10),
    staffPerformanceRating: z.number().min(1).max(10),
  }),
  lessonsLearned: z.string(),
  improvements: z.string(),
})

export function PostEventEvaluationForm() {
  const { event, dispatch } = useEvent()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      financialReport: event?.postEventEvaluation?.financialReport || {
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
      },
      attendanceCount: event?.postEventEvaluation?.attendanceCount || 0,
      surveyResults: event?.postEventEvaluation?.surveyResults || {
        overallSatisfaction: 5,
        communicationRating: 5,
        venueRating: 5,
        staffPerformanceRating: 5,
      },
      lessonsLearned: event?.postEventEvaluation?.lessonsLearned || "",
      improvements: event?.postEventEvaluation?.improvements || "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    dispatch({
      type: "UPDATE_EVENT",
      payload: { postEventEvaluation: values },
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Reporte Financiero</h3>
          <FormField
            control={form.control}
            name="financialReport.totalRevenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingresos Totales</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="financialReport.totalExpenses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gastos Totales</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="financialReport.netProfit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beneficio Neto</FormLabel>
                <FormControl>
                  <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="attendanceCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Asistentes</FormLabel>
              <FormControl>
                <Input {...field} type="number" onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Resultados de la Encuesta</h3>
          <FormField
            control={form.control}
            name="surveyResults.overallSatisfaction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satisfacción General (1-10)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={10}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surveyResults.communicationRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calificación de la Comunicación (1-10)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={10}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surveyResults.venueRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calificación del Lugar (1-10)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={10}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surveyResults.staffPerformanceRating"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Calificación del Desempeño del Personal (1-10)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={10}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="lessonsLearned"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lecciones Aprendidas</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Describe las lecciones aprendidas durante el evento..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="improvements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mejoras para Futuros Eventos</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Sugiere mejoras para futuros eventos..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Guardar Evaluación Post-Evento</Button>
      </form>
    </Form>
  )
}

