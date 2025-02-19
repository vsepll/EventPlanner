import { google } from 'googleapis'
import { Event } from '@/types/event'

const SCOPES = ['https://www.googleapis.com/auth/calendar']

interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

export class GoogleCalendarService {
  private auth
  private calendar

  constructor(config: GoogleCalendarConfig) {
    this.auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
    this.calendar = google.calendar({ version: 'v3', auth: this.auth })
  }

  setCredentials(tokens: any) {
    this.auth.setCredentials(tokens)
  }

  async createCalendarEvent(event: Event): Promise<string> {
    try {
      const calendarEvent = {
        summary: event.name,
        location: event.venue,
        description: `
          Tipo: ${event.type}
          Capacidad: ${event.capacity}
          Proyección de ventas: ${event.salesProjection.estimatedTickets} entradas
          Ganancia proyectada: ${event.salesProjection.projectedProfit}
        `,
        start: {
          date: event.date,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          date: event.date,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        reminders: {
          useDefault: true
        }
      }

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: calendarEvent,
      })

      return response.data.id || ''
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw error
    }
  }

  async updateCalendarEvent(eventId: string, event: Event): Promise<void> {
    try {
      const calendarEvent = {
        summary: event.name,
        location: event.venue,
        description: `
          Tipo: ${event.type}
          Capacidad: ${event.capacity}
          Proyección de ventas: ${event.salesProjection.estimatedTickets} entradas
          Ganancia proyectada: ${event.salesProjection.projectedProfit}
        `,
        start: {
          date: event.date,
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          date: event.date,
          timeZone: 'America/Argentina/Buenos_Aires',
        }
      }

      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: calendarEvent,
      })
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw error
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      })
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw error
    }
  }

  getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    })
  }

  async getTokens(code: string) {
    const { tokens } = await this.auth.getToken(code)
    return tokens
  }
} 