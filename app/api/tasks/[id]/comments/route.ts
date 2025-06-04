import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createCommentSchema = z.object({
  content: z.string().min(1, "El contenido no puede estar vacío").max(1000, "El contenido es demasiado largo")
})

// Crear comentario
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
    const data = createCommentSchema.parse(body)

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

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        taskId: params.id,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando comentario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Obtener comentarios de una tarea
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

    const comments = await prisma.comment.findMany({
      where: {
        taskId: params.id
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error obteniendo comentarios:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 