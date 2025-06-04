import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createTimeEntrySchema = z.object({
  description: z.string().optional(),
  duration: z.number().min(0, "La duración debe ser positiva"),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  isManual: z.boolean().optional().default(false)
})

const startTimerSchema = z.object({
  description: z.string().optional()
})

// Crear entrada de tiempo
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createTimeEntrySchema.parse(body)

    // Verificar que el usuario tenga acceso a la tarea
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          workspace: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada o sin acceso" },
        { status: 404 }
      )
    }

    // Para entradas manuales, startTime y endTime son opcionales
    // Para entradas automáticas (cronómetro), startTime es requerido
    if (!data.isManual && !data.startTime) {
      return NextResponse.json(
        { error: "startTime es requerido para entradas automáticas" },
        { status: 400 }
      )
    }

    const timeEntryData: any = {
      description: data.description,
      duration: data.duration,
      isManual: data.isManual,
      taskId: params.id,
      userId: session.user.id
    }

    if (data.startTime) {
      timeEntryData.startTime = new Date(data.startTime)
    }

    if (data.endTime) {
      timeEntryData.endTime = new Date(data.endTime)
    } else if (data.startTime) {
      timeEntryData.endTime = new Date()
    }

    const timeEntry = await prisma.timeEntry.create({
      data: timeEntryData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(timeEntry, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando entrada de tiempo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Obtener entradas de tiempo de una tarea
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar que el usuario tenga acceso a la tarea
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          workspace: {
            members: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada o sin acceso" },
        { status: 404 }
      )
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        taskId: params.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startTime: 'desc'
      }
    })

    return NextResponse.json(timeEntries)
  } catch (error) {
    console.error("Error obteniendo entradas de tiempo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 