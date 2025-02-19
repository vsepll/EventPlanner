export type EventType = "festival" | "sports" | "conference" | "party" | "other"

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
}

export interface Resource {
  id: string
  name: string
  quantity: number
  quoted: boolean
  cost?: number
}

export interface SalesProjection {
  estimatedTickets: number
  averageTicketPrice: number
  costs: {
    ticketing: number    // Costos de boletería
    accommodation: number // Hospedaje
    fuel: number         // Combustible
    accessControl: number // Costos control de accesos
  }
  totalRevenue: number
  totalCosts: number
  projectedProfit: number
}

export interface BoxOffice {
  id: string
  name: string
  location: string
  schedule: {
    startDate: string
    endDate: string
    operatingHours: {
      start: string
      end: string
    }
  }
  staff: {
    ticketSellers: number  // Boleteros
    supervisors: number    // Supervisores
  }
}

export interface TicketingConfig {
  saleMode: "online" | "hybrid" | "physical"
  boxOffices: BoxOffice[]
}

export interface AccessControl {
  method: "app" | "external"
  equipment: {
    quantity: number
    type: "we_rent" | "we_rent_out" | "owned"
    quoted: boolean
    cost?: number
  }
  staff: {
    quantity: number
  }
  internet: "organizer" | "own"
}

export type ChangeLogAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'duplicate'

export interface ChangeLogEntry {
  id: string
  eventId: string
  action: ChangeLogAction
  field?: string
  oldValue?: any
  newValue?: any
  timestamp: string
  userId: string
  userName: string
}

export interface Event {
  id: string
  name: string
  type: EventType
  date: string
  venue: string
  budget: {
    revenue: number
    expenses: number
    profit: number
  }
  contractSigned: boolean
  contract?: {
    signed: boolean
    signedAt?: string
    documentUrl?: string
    documentName?: string
  }
  previousExperience?: {
    exists: boolean
    details?: {
      ticketing?: string
      accessControl?: string
      general?: string
    }
  }
  salesProjection: SalesProjection
  resources: Resource[]
  mainContact: Contact
  ticketing: TicketingConfig
  accessControl: AccessControl
  status: "draft" | "planning" | "active" | "completed"
  progress: number
  changeLogs?: ChangeLogEntry[]
  isRecurring?: boolean
  recurringConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval: number
    endDate?: string
    daysOfWeek?: number[]
  }
  originalEventId?: string // Para eventos duplicados
  calendarIntegrations?: {
    googleCalendarEventId?: string
    outlookCalendarEventId?: string
    syncEnabled: boolean
  }
}

