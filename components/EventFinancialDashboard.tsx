"use client"

import { Event } from "@/types/event"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { memo, useRef, useMemo, useState, useEffect, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut } from "lucide-react"

interface EventFinancialDashboardProps {
  event: Event
}

// Constantes memoizadas
const COLORS = Object.freeze(["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"])
const MIN_RADIUS = 150
const MAX_RADIUS = 300
const RADIAN = Math.PI / 180

// Componente memoizado para las etiquetas personalizadas
const CustomizedLabel = memo(({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const radius = outerRadius + 25
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="currentColor"
      className="text-sm font-medium"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  )
})

CustomizedLabel.displayName = 'CustomizedLabel'

// Componente memoizado para las tarjetas KPI
const KPICard = memo(({ title, value }: { title: string; value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
))

KPICard.displayName = 'KPICard'

export const EventFinancialDashboard = memo(({ event }: EventFinancialDashboardProps) => {
  const pieChartRef = useRef<any>(null)
  const barChartRef = useRef<any>(null)
  const [pieRadius, setPieRadius] = useState(200)

  // Función memoizada para formatear moneda
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }, [])

  // Datos memoizados para el gráfico de barras
  const revenueExpensesData = useMemo(() => [{
    name: event.name,
    ingresos: event.salesProjection.totalRevenue,
    gastos: event.salesProjection.totalCosts,
    beneficio: event.salesProjection.projectedProfit,
  }], [event.name, event.salesProjection])

  // Datos memoizados para el gráfico circular
  const costBreakdownData = useMemo(() => {
    const costs = event.salesProjection.costs
    return [
      { name: "Boletería", value: costs.ticketing },
      { name: "Hospedaje", value: costs.accommodation },
      { name: "Combustible", value: costs.fuel },
      { name: "Control de Accesos", value: costs.accessControl },
    ]
  }, [event.salesProjection.costs])

  // KPIs memoizados
  const kpis = useMemo(() => {
    const { totalRevenue, totalCosts, projectedProfit } = event.salesProjection
    const profitMargin = totalRevenue > 0 ? (projectedProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalCosts,
      totalProfit: projectedProfit,
      profitMargin,
    }
  }, [event.salesProjection])

  // Función memoizada para convertir SVG a PNG
  const svgToPng = useCallback((svgElement: SVGElement): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      canvas.width = 800
      canvas.height = 600

      const svgString = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)

      img.onload = () => {
        if (ctx) {
          ctx.fillStyle = 'white'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          reject(new Error('No se pudo obtener el contexto 2D del canvas'))
        }
        URL.revokeObjectURL(url)
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Error al cargar la imagen SVG'))
      }

      img.src = url
    })
  }, [])

  // Función memoizada para obtener imágenes de los gráficos
  const getChartsImages = useCallback(async () => {
    try {
      const images = {
        costBreakdown: '',
        revenueExpenses: ''
      }

      if (pieChartRef.current) {
        const pieChartSVG = pieChartRef.current.container.querySelector('svg')
        if (pieChartSVG) {
          const clonedPieSVG = pieChartSVG.cloneNode(true) as SVGElement
          clonedPieSVG.setAttribute('width', '800')
          clonedPieSVG.setAttribute('height', '600')
          images.costBreakdown = await svgToPng(clonedPieSVG)
        }
      }

      if (barChartRef.current) {
        const barChartSVG = barChartRef.current.container.querySelector('svg')
        if (barChartSVG) {
          const clonedBarSVG = barChartSVG.cloneNode(true) as SVGElement
          clonedBarSVG.setAttribute('width', '800')
          clonedBarSVG.setAttribute('height', '600')
          images.revenueExpenses = await svgToPng(clonedBarSVG)
        }
      }

      return images
    } catch (error) {
      console.error('Error al generar imágenes de los gráficos:', error)
      return {
        costBreakdown: '',
        revenueExpenses: ''
      }
    }
  }, [svgToPng])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getFinancialChartsImages = getChartsImages
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).getFinancialChartsImages
      }
    }
  }, [getChartsImages])

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Ingresos Totales" value={formatCurrency(kpis.totalRevenue)} />
        <KPICard title="Costos Totales" value={formatCurrency(kpis.totalCosts)} />
        <KPICard title="Beneficio Total" value={formatCurrency(kpis.totalProfit)} />
        <KPICard title="Margen de Beneficio" value={`${kpis.profitMargin.toFixed(1)}%`} />
      </div>

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] bg-muted/50 rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                ref={barChartRef}
                data={revenueExpensesData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius)',
                  }}
                />
                <Legend />
                <Bar dataKey="ingresos" fill="#3b82f6" />
                <Bar dataKey="gastos" fill="#ef4444" />
                <Bar dataKey="beneficio" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribución de Costos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4 px-8">
              <ZoomOut className="h-5 w-5 text-muted-foreground" />
              <Slider
                value={[pieRadius]}
                onValueChange={([value]) => setPieRadius(value)}
                min={MIN_RADIUS}
                max={MAX_RADIUS}
                step={10}
                className="w-[300px]"
              />
              <ZoomIn className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="h-[600px] bg-muted/50 rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart ref={pieChartRef}>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={CustomizedLabel}
                    outerRadius={pieRadius}
                    innerRadius={pieRadius * 0.6}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                        className="stroke-background stroke-2"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

EventFinancialDashboard.displayName = 'EventFinancialDashboard' 