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

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        color: data.color || "#7B68EE",
        workspaceId: data.workspaceId,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: "ACTIVE"
      },
      include: {
        workspace: {
          select: {
            id: true,
            name: true
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

    // Obtener proyectos donde el usuario es miembro del workspace
    const projects = await prisma.project.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId: session.user.id
            }
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas manualmente y añadir workspaceId
    const projectsWithStats = projects.map(project => ({
      ...project,
      workspaceId: project.workspace.id,
      _count: {
        tasks: project.tasks.length,
        completedTasks: project.tasks.filter(task => task.status === "DONE").length
      },
      tasks: undefined // Remover las tareas del resultado
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