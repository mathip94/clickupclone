import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { z } from "zod"

const createProjectSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color inválido").optional(),
  workspaceId: z.string().min(1, "El workspace es requerido"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional()
})

// Crear proyecto
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createProjectSchema.parse(body)

    // Verificar que el usuario tenga acceso al workspace
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: data.workspaceId,
        userId: session.user.id
      }
    })

    if (!workspaceMember) {
      return NextResponse.json(
        { error: "No tienes acceso a este workspace" },
        { status: 403 }
      )
    }

    // Crear proyecto y añadir al creador como owner
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#7B68EE",
        workspaceId: data.workspaceId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: "ACTIVE",
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        }
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error creando proyecto:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Listar proyectos del usuario
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    // Obtener proyectos donde el usuario es miembro directo del proyecto
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
          }
        },
        ...(workspaceId && { workspaceId })
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true
          }
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        },
        members: {
          where: {
            userId: session.user.id
          },
          select: {
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas manualmente y añadir información del usuario
    const projectsWithStats = projects.map(project => ({
      ...project,
      workspaceId: project.workspace.id,
      userRole: project.members[0]?.role || "MEMBER",
      _count: {
        tasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.status === "DONE").length
      },
      tasks: undefined, // Remover las tareas del resultado
      members: undefined // Remover los miembros del resultado (ya tenemos userRole)
    }))

    return NextResponse.json(projectsWithStats)
  } catch (error) {
    console.error("Error obteniendo proyectos:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 