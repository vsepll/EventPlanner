import { NextResponse } from "next/server"
import { connect } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    const { db } = await connect()
    const events = await db.collection("events").find().toArray()
    
    return NextResponse.json(events.map(event => ({
      ...event,
      id: event._id.toString(),
      _id: undefined
    })))
  } catch (error) {
    console.error("Error al obtener eventos:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al obtener los eventos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("Iniciando creación de evento")
    const { db } = await connect()
    console.log("Conexión a MongoDB establecida")
    
    const eventData = await request.json()
    console.log("Datos del evento recibidos:", eventData)
    
    // Validación básica
    if (!eventData.name || !eventData.type || !eventData.date || !eventData.venue) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      )
    }

    // Formatear los datos antes de guardar
    const event = {
      ...eventData,
      createdAt: new Date(),
      updatedAt: new Date(),
      accessControl: {
        method: "app",
        equipment: {
          quantity: 0,
          type: "we_rent",
          quoted: false,
          cost: 0
        },
        staff: {
          quantity: 0
        },
        internet: "organizer"
      },
      salesProjection: {
        onlineTickets: Number(eventData.salesProjection?.onlineTickets || 0),
        boxOfficeTickets: Number(eventData.salesProjection?.boxOfficeTickets || 0),
      }
    }
    
    const result = await db.collection("events").insertOne(event)
    console.log("Evento creado con ID:", result.insertedId)
    
    // Devolver el evento completo con su ID
    return NextResponse.json({ 
      id: result.insertedId.toString(),
      ...event
    })
  } catch (error) {
    console.error("Error detallado al crear evento:", error)
    const errorMessage = error instanceof Error 
      ? `Error al crear el evento: ${error.message}`
      : "Error desconocido al crear el evento"
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

