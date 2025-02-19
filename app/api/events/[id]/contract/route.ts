import { NextResponse } from "next/server"
import { connect } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { writeFile } from "fs/promises"
import { join } from "path"
import { mkdir } from "fs/promises"

// Directorio para almacenar los archivos
const UPLOADS_DIR = join(process.cwd(), "public", "uploads", "contracts")

// Asegurarse de que el directorio existe
async function ensureUploadsDir() {
  try {
    await mkdir(UPLOADS_DIR, { recursive: true })
  } catch (error) {
    console.error("Error creating uploads directory:", error)
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await ensureUploadsDir()
    
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${params.id}-${Date.now()}-${file.name}`
    const filepath = join(UPLOADS_DIR, filename)
    
    await writeFile(filepath, buffer)
    
    const { db } = await connect()
    
    // Actualizar el documento del evento con la información del contrato
    await db.collection("events").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          "contract.documentUrl": `/uploads/contracts/${filename}`,
          "contract.documentName": file.name,
          "contract.uploadedAt": new Date().toISOString(),
        },
      }
    )
    
    return NextResponse.json({
      message: "Archivo subido exitosamente",
      documentUrl: `/uploads/contracts/${filename}`,
      documentName: file.name,
    })
  } catch (error) {
    console.error("Error al subir el archivo:", error)
    return NextResponse.json(
      { error: "Error al procesar el archivo" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connect()
    
    const event = await db.collection("events").findOne(
      { _id: new ObjectId(params.id) }
    )
    
    if (!event || !event.contract?.documentUrl) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      documentUrl: event.contract.documentUrl,
      documentName: event.contract.documentName,
    })
  } catch (error) {
    console.error("Error al obtener el documento:", error)
    return NextResponse.json(
      { error: "Error al obtener el documento" },
      { status: 500 }
    )
  }
} 