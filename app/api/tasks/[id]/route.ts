import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional()
})

// Obtener tarea específica
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
      },
      include: {
        project: {
          select: {
            name: true,
            color: true,
            workspace: {
              select: {
                name: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        comments: {
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
        },
        timeEntries: {
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
        },
        _count: {
          select: {
            comments: true,
            timeEntries: true
          }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error obteniendo tarea:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Actualizar tarea
export async function PATCH(
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
    const data = updateTaskSchema.parse(body)

    // Verificar que el usuario tenga acceso a la tarea
    const existingTask = await prisma.task.findFirst({
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
      },
      include: {
        project: {
          select: {
            workspaceId: true
          }
        }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada o sin acceso" },
        { status: 404 }
      )
    }

    // Si se está cambiando el assignee, verificar que sea miembro del workspace
    if (data.assigneeId) {
      const assignee = await prisma.workspaceMember.findFirst({
        where: {
          userId: data.assigneeId,
          workspaceId: existingTask.project.workspaceId
        }
      })

      if (!assignee) {
        return NextResponse.json(
          { error: "El usuario asignado no es miembro del workspace" },
          { status: 400 }
        )
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
        ...(data.priority && { priority: data.priority }),
        ...(data.status && { status: data.status }),
        ...(data.startDate !== undefined && { 
          startDate: data.startDate ? new Date(data.startDate) : null 
        }),
        ...(data.dueDate !== undefined && { 
          dueDate: data.dueDate ? new Date(data.dueDate) : null 
        })
      },
      include: {
        project: {
          select: {
            name: true,
            color: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            comments: true,
            timeEntries: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error actualizando tarea:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Eliminar tarea
export async function DELETE(
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
    const existingTask = await prisma.task.findFirst({
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

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada o sin acceso" },
        { status: 404 }
      )
    }

    await prisma.task.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Tarea eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando tarea:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 