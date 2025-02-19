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
import { useRef, useMemo, useState } from "react"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut } from "lucide-react"

interface FinancialDashboardProps {
  events: Event[]
}

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b"]
const MIN_RADIUS = 150
const MAX_RADIUS = 300

const RADIAN = Math.PI / 180
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
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
}

export function FinancialDashboard({ events }: FinancialDashboardProps) {
  const pieChartRef = useRef<any>(null)
  const barChartRef = useRef<any>(null)
  const [pieRadius, setPieRadius] = useState(200)

  // Preparar datos para el gráfico de barras de ingresos vs gastos
  const revenueExpensesData = useMemo(() => {
    return events.map(event => ({
      name: event.name,
      ingresos: event.salesProjection.totalRevenue,
      gastos: event.salesProjection.totalCosts,
      beneficio: event.salesProjection.projectedProfit,
    }))
  }, [events])

  // Preparar datos para el gráfico circular de costos
  const costBreakdownData = useMemo(() => {
    const totalCosts = events.reduce((acc, event) => {
      const costs = event.salesProjection.costs
      return {
        boleteria: acc.boleteria + costs.ticketing,
        hospedaje: acc.hospedaje + costs.accommodation,
        combustible: acc.combustible + costs.fuel,
        accesos: acc.accesos + costs.accessControl,
      }
    }, {
      boleteria: 0,
      hospedaje: 0,
      combustible: 0,
      accesos: 0,
    })

    return [
      { name: "Boletería", value: totalCosts.boleteria },
      { name: "Hospedaje", value: totalCosts.hospedaje },
      { name: "Combustible", value: totalCosts.combustible },
      { name: "Control de Accesos", value: totalCosts.accesos },
    ]
  }, [events])

  // Calcular KPIs
  const kpis = useMemo(() => {
    const totalRevenue = events.reduce((sum, event) => sum + event.salesProjection.totalRevenue, 0)
    const totalCosts = events.reduce((sum, event) => sum + event.salesProjection.totalCosts, 0)
    const totalProfit = events.reduce((sum, event) => sum + event.salesProjection.projectedProfit, 0)
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
    }
  }, [events])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalCosts)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficio Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis.totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Beneficio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.profitMargin.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Card>
        <CardHeader>
          <CardTitle>Ingresos vs Gastos por Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
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
                    label={renderCustomizedLabel}
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

      {/* Lista de eventos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="p-4">
            <CardHeader>
              <CardTitle className="text-lg">{event.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Ingresos:</span>
                  <span>{formatCurrency(event.salesProjection.totalRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costos:</span>
                  <span>{formatCurrency(event.salesProjection.totalCosts)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Beneficio:</span>
                  <span>{formatCurrency(event.salesProjection.projectedProfit)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 