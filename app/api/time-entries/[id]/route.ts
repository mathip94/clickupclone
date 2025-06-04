import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Eliminar registro de tiempo
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

    // Verificar que el registro de tiempo existe y el usuario tiene permisos para eliminarlo
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        OR: [
          { userId: session.user.id }, // El autor puede eliminar
          {
            task: {
              project: {
                workspace: {
                  members: {
                    some: {
                      userId: session.user.id,
                      role: { in: ['ADMIN', 'OWNER'] } // Admin/Owner pueden eliminar
                    }
                  }
                }
              }
            }
          }
        ]
      }
    })

    if (!timeEntry) {
      return NextResponse.json(
        { error: "Registro de tiempo no encontrado o sin permisos" },
        { status: 404 }
      )
    }

    await prisma.timeEntry.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Registro de tiempo eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando registro de tiempo:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 