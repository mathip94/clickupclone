import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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

    // Verificar que el usuario sea miembro del workspace
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: params.id,
        members: {
          some: {
            userId: session.user.id
          }
        }
      }
    })

    if (!workspace) {
      return NextResponse.json(
        { error: "Workspace no encontrado o sin acceso" },
        { status: 404 }
      )
    }

    // Obtener miembros del workspace
    const members = await prisma.workspaceMember.findMany({
      where: {
        workspaceId: params.id
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
        role: 'asc'
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error obteniendo miembros del workspace:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 