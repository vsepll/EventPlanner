import { NextResponse } from "next/server"
import { connect } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connect()
    
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "ID de evento inválido" },
        { status: 400 }
      )
    }

    const event = await db.collection("events").findOne({
      _id: new ObjectId(params.id),
    })

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...event,
      id: event._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error al obtener el evento:", error)
    return NextResponse.json(
      { error: "Error al obtener el evento" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connect()
    const updates = await request.json()

    const result = await db.collection("events").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...result,
      id: result._id.toString(),
      _id: undefined,
    })
  } catch (error) {
    console.error("Error al actualizar el evento:", error)
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connect()
    const result = await db.collection("events").deleteOne({
      _id: new ObjectId(params.id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar el evento:", error)
    return NextResponse.json(
      { error: "Error al eliminar el evento" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: "ID de evento inválido" },
        { status: 400 }
      )
    }

    const { db } = await connect()
    const updates = await request.json()

    const result = await db.collection("events").findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    )

    if (!result) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      )
    }

    const updatedEvent = {
      ...result,
      id: result._id.toString(),
      _id: undefined,
    }

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error al actualizar el evento:", error)
    return NextResponse.json(
      { error: "Error al actualizar el evento" },
      { status: 500 }
    )
  }
}

