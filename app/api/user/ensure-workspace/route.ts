import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Verificar si el usuario ya tiene un workspace
    const existingWorkspace = await prisma.workspaceMember.findFirst({
      where: {
        userId: session.user.id
      },
      include: {
        workspace: true
      }
    })

    if (existingWorkspace) {
      return NextResponse.json({
        message: "El usuario ya tiene un workspace",
        workspace: existingWorkspace.workspace
      })
    }

    // Crear workspace personal para el usuario
    const workspace = await prisma.workspace.create({
      data: {
        name: `Workspace de ${session.user.name || session.user.email}`,
        description: "Tu espacio de trabajo personal",
        color: "#7B68EE",
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER"
          }
        }
      }
    })

    return NextResponse.json({
      message: "Workspace creado exitosamente",
      workspace
    })
  } catch (error) {
    console.error("Error asegurando workspace:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 