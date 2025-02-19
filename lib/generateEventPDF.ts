import jsPDF from 'jspdf'
import { Event } from '@/types/event'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import 'jspdf-autotable'
import { UserOptions } from 'jspdf-autotable'

// Extender el tipo jsPDF para incluir autoTable
interface ExtendedJsPDF extends jsPDF {
  autoTable: (options: UserOptions) => void
  lastAutoTable: { finalY: number }
}

export async function generateEventPDF(event: Event) {
  const doc = new jsPDF() as ExtendedJsPDF
  let y = 20

  // Funciones auxiliares
  const addSection = (title: string) => {
    doc.setFillColor(240, 240, 240)
    doc.rect(20, y - 5, doc.internal.pageSize.width - 40, 10, 'F')
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(60, 60, 60)
    doc.text(title, 20, y)
    y += 10
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
  }

  const addField = (label: string, value: string | number | undefined, indent: number = 0) => {
    if (value === undefined || value === '') return
    doc.text(`${label}:`, 20 + indent, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${value}`, 80 + indent, y)
    y += 7
  }

  const addSpacer = (height: number = 10) => {
    y += height
  }

  const checkPageBreak = () => {
    if (y > 270) {
      doc.addPage()
      y = 20
    }
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: es })
  }

  // Título del documento
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  doc.text('Planificación del Evento', 105, y, { align: 'center' })
  y += 15

  // Información básica
  addSection('Información General')
  addField('Nombre', event.name)
  addField('Tipo', event.type)
  addField('Fecha', formatDate(event.date))
  addField('Lugar', event.venue)
  addSpacer()

  // Contacto Principal
  if (event.mainContact) {
    addSection('Contacto Principal')
    addField('Nombre', event.mainContact.name)
    addField('Email', event.mainContact.email)
    addField('Teléfono', event.mainContact.phone)
    addField('Rol', event.mainContact.role)
    addSpacer()
  }

  // Sección Financiera
  checkPageBreak()
  addSection('Dashboard Financiero')
  
  // KPIs Financieros
  const profitMargin = event.salesProjection.totalRevenue > 0 
    ? (event.salesProjection.projectedProfit / event.salesProjection.totalRevenue) * 100 
    : 0

  doc.setFont('helvetica', 'bold')
  doc.text('Resumen Financiero', 20, y)
  y += 7
  doc.setFont('helvetica', 'normal')

  // Crear una tabla para los KPIs
  doc.autoTable({
    head: [['Indicador', 'Valor']],
    body: [
      ['Ingresos Totales', formatCurrency(event.salesProjection.totalRevenue)],
      ['Costos Totales', formatCurrency(event.salesProjection.totalCosts)],
      ['Beneficio Proyectado', formatCurrency(event.salesProjection.projectedProfit)],
      ['Margen de Beneficio', `${profitMargin.toFixed(1)}%`],
      ['Tickets Estimados', event.salesProjection.estimatedTickets.toLocaleString()],
      ['Precio Promedio', formatCurrency(event.salesProjection.averageTicketPrice)],
      ['Ingreso por Ticket', formatCurrency(event.salesProjection.projectedProfit / event.salesProjection.estimatedTickets)]
    ],
    startY: y,
    margin: { left: 20 },
    headStyles: { fillColor: [100, 100, 100] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: 'grid'
  })

  y = doc.lastAutoTable.finalY + 10
  addSpacer()

  // Desglose de Costos
  doc.setFont('helvetica', 'bold')
  doc.text('Desglose de Costos', 20, y)
  y += 7
  doc.setFont('helvetica', 'normal')

  const costs = event.salesProjection.costs
  const totalCosts = Object.values(costs).reduce((a, b) => a + b, 0)

  // Crear tabla de costos con porcentajes
  doc.autoTable({
    head: [['Categoría', 'Monto', 'Porcentaje']],
    body: [
      ['Boletería', formatCurrency(costs.ticketing), `${((costs.ticketing / totalCosts) * 100).toFixed(1)}%`],
      ['Hospedaje', formatCurrency(costs.accommodation), `${((costs.accommodation / totalCosts) * 100).toFixed(1)}%`],
      ['Combustible', formatCurrency(costs.fuel), `${((costs.fuel / totalCosts) * 100).toFixed(1)}%`],
      ['Control de Accesos', formatCurrency(costs.accessControl), `${((costs.accessControl / totalCosts) * 100).toFixed(1)}%`],
      ['Total', formatCurrency(totalCosts), '100%']
    ],
    startY: y,
    margin: { left: 20 },
    headStyles: { fillColor: [100, 100, 100] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    theme: 'grid'
  })

  y = doc.lastAutoTable.finalY + 10
  addSpacer()

  // Agregar gráficos financieros
  if (typeof window !== 'undefined' && (window as any).getFinancialChartsImages) {
    try {
      const chartImages = await (window as any).getFinancialChartsImages()
      
      if (chartImages.revenueExpenses) {
        // Gráfico de Ingresos vs Gastos
        checkPageBreak()
        doc.setFont('helvetica', 'bold')
        doc.text('Gráfico de Ingresos vs Gastos', 20, y)
        y += 10
        
        try {
          doc.addImage({
            imageData: chartImages.revenueExpenses,
            format: 'PNG',
            x: 20,
            y: y,
            width: 170,
            height: 100,
            compression: 'NONE'
          })
          y += 110
          addSpacer()
        } catch (error) {
          console.error('Error al agregar gráfico de ingresos vs gastos:', error)
        }
      }

      if (chartImages.costBreakdown) {
        // Gráfico de Distribución de Costos
        checkPageBreak()
        doc.setFont('helvetica', 'bold')
        doc.text('Gráfico de Distribución de Costos', 20, y)
        y += 10
        
        try {
          doc.addImage({
            imageData: chartImages.costBreakdown,
            format: 'PNG',
            x: 20,
            y: y,
            width: 170,
            height: 100,
            compression: 'NONE'
          })
          y += 110
          addSpacer()
        } catch (error) {
          console.error('Error al agregar gráfico de distribución de costos:', error)
        }
      }
    } catch (error) {
      console.error('Error al obtener imágenes de los gráficos:', error)
    }
  }

  // Personal
  checkPageBreak()
  if (event.accessControl?.staff?.assigned && event.accessControl.staff.assigned.length > 0) {
    addSection('Personal Asignado')
    
    // Crear tabla de personal
    const staffHeaders = [['Nombre', 'Rol', 'Email']]
    const staffData = event.accessControl.staff.assigned.map(member => [
      member.name,
      member.role,
      member.email
    ])

    doc.autoTable({
      head: staffHeaders,
      body: staffData,
      startY: y,
      margin: { left: 20 },
      headStyles: { fillColor: [100, 100, 100] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    })

    y = doc.lastAutoTable.finalY + 10
    addSpacer()
  }

  // Control de Accesos
  checkPageBreak()
  if (event.accessControl) {
    addSection('Control de Accesos')
    
    // Personal requerido
    if (event.accessControl.staff) {
      doc.setFont('helvetica', 'bold')
      doc.text('Personal Requerido:', 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      
      addField('Cantidad Total', event.accessControl.staff.quantity, 10)
      addSpacer()
    }

    // Equipamiento
    if (event.accessControl.equipment) {
      doc.setFont('helvetica', 'bold')
      doc.text('Equipamiento:', 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')

      const equipment = event.accessControl.equipment
      addField('Cantidad', equipment.quantity, 10)
      addField('Tipo', equipment.type === 'rental' ? 'Alquiler' : 'Propio', 10)
      if (equipment.cost) {
        addField('Costo', formatCurrency(equipment.cost), 10)
      }
      addField('Cotizado', equipment.quoted ? 'Sí' : 'No', 10)
    }
  }

  // Boletería
  checkPageBreak()
  if (event.ticketing?.boxOffices && event.ticketing.boxOffices.length > 0) {
    addSection('Puntos de Venta')
    
    event.ticketing.boxOffices.forEach((office, index) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`Boletería ${index + 1}: ${office.name}`, 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      
      addField('Ubicación', office.location, 10)
      addField('Horario', `${office.schedule.operatingHours.start} - ${office.schedule.operatingHours.end}`, 10)
      
      // Fechas de operación
      const startDate = formatDate(office.schedule.startDate)
      const endDate = formatDate(office.schedule.endDate)
      addField('Período', `${startDate} - ${endDate}`, 10)
      
      // Personal asignado
      addField('Personal', `${office.staff.ticketSellers} boleteros, ${office.staff.supervisors} supervisores`, 10)
      
      if (index < event.ticketing.boxOffices.length - 1) {
        addSpacer()
        doc.setDrawColor(200, 200, 200)
        doc.line(20, y - 5, 190, y - 5)
        addSpacer(5)
      }
      
      checkPageBreak()
    })
  }

  // Experiencia Previa
  if (event.previousExperience?.exists && event.previousExperience?.details) {
    checkPageBreak()
    addSection('Experiencia Previa')
    
    const details = event.previousExperience.details
    
    if (details?.ticketing) {
      doc.setFont('helvetica', 'bold')
      doc.text('Experiencia en Boletería:', 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      const ticketingLines = doc.splitTextToSize(details.ticketing, 160)
      doc.text(ticketingLines, 20, y)
      y += ticketingLines.length * 7
      addSpacer(5)
    }

    if (details?.accessControl) {
      doc.setFont('helvetica', 'bold')
      doc.text('Experiencia en Control de Accesos:', 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      const accessControlLines = doc.splitTextToSize(details.accessControl, 160)
      doc.text(accessControlLines, 20, y)
      y += accessControlLines.length * 7
      addSpacer(5)
    }

    if (details?.general) {
      doc.setFont('helvetica', 'bold')
      doc.text('Experiencia General:', 20, y)
      y += 7
      doc.setFont('helvetica', 'normal')
      const generalLines = doc.splitTextToSize(details.general, 160)
      doc.text(generalLines, 20, y)
      y += generalLines.length * 7
    }
  }

  // Pie de página
  const totalPages = (doc.internal as any).getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Página ${i} de ${totalPages}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
    doc.text(
      `Generado el ${format(new Date(), 'PPpp', { locale: es })}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )
  }

  // Guardar el PDF
  const fileName = `${event.name.toLowerCase().replace(/\s+/g, '-')}-planificacion.pdf`
  doc.save(fileName)
} 