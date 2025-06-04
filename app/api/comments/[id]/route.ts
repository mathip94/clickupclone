import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// Eliminar comentario
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

    // Verificar que el comentario existe y el usuario tiene permisos para eliminarlo
    const comment = await prisma.comment.findFirst({
      where: {
        id: params.id,
        OR: [
          { authorId: session.user.id }, // El autor puede eliminar
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

    if (!comment) {
      return NextResponse.json(
        { error: "Comentario no encontrado o sin permisos" },
        { status: 404 }
      )
    }

    await prisma.comment.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Comentario eliminado exitosamente" })
  } catch (error) {
    console.error("Error eliminando comentario:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
} 