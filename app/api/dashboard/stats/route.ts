import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Obtener todas las tareas del usuario
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdById: userId },
          { assigneeId: userId }
        ],
        project: {
          workspace: {
            members: {
              some: {
                userId
              }
            }
          }
        }
      },
      select: {
        id: true,
        status: true,
        priority: true,
        createdAt: true,
        project: {
          select: {
            name: true,
            color: true
          }
        }
      }
    })

    // Obtener proyectos del usuario
    const projects = await prisma.project.findMany({
      where: {
        workspace: {
          members: {
            some: {
              userId
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        status: true,
        color: true,
        createdAt: true,
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    // Calcular tiempo de hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayTimeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        startTime: {
          gte: today,
          lt: tomorrow
        }
      },
      select: {
        duration: true
      }
    })

    // Obtener tareas recientes (últimas 5)
    const recentTasks = await prisma.task.findMany({
      where: {
        OR: [
          { createdById: userId },
          { assigneeId: userId }
        ],
        project: {
          workspace: {
            members: {
              some: {
                userId
              }
            }
          }
        }
      },
      include: {
        project: {
          select: {
            name: true,
            color: true
          }
        },
        assignee: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5
    })

    // Calcular estadísticas
    const totalTasks = tasks.length
    const inProgressTasks = tasks.filter(task => task.status === "IN_PROGRESS").length
    const completedTasks = tasks.filter(task => task.status === "DONE").length
    const todoTasks = tasks.filter(task => task.status === "TODO").length
    const todayTimeMinutes = todayTimeEntries.reduce((sum, entry) => sum + entry.duration, 0)
    const todayTimeHours = Math.round((todayTimeMinutes / 60) * 10) / 10

    // Proyectos con estadísticas
    const projectsWithStats = projects.map(project => ({
      id: project.id,
      name: project.name,
      color: project.color,
      status: project.status,
      totalTasks: project.tasks.length,
      completedTasks: project.tasks.filter(task => task.status === "DONE").length,
      progress: project.tasks.length > 0 
        ? Math.round((project.tasks.filter(task => task.status === "DONE").length / project.tasks.length) * 100)
        : 0
    }))

    const stats = {
      totalTasks,
      inProgressTasks,
      completedTasks,
      todoTasks,
      todayTime: todayTimeHours,
      totalProjects: projects.length,
      activeProjects: projects.filter(project => project.status === "ACTIVE").length,
      recentTasks,
      projects: projectsWithStats.slice(0, 4) // Top 4 projects
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error obteniendo estadísticas del dashboard:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 