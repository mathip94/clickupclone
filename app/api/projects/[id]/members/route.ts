import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const inviteUserSchema = z.object({
  email: z.string().email("Valid email is required"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).optional().default("MEMBER"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = inviteUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;
    const projectId = params.id;

    // Verificar que el usuario actual es admin o owner del proyecto
    const currentMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "You don't have permission to invite users to this project" },
        { status: 403 }
      );
    }

    // Buscar el usuario por email
    const userToInvite = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!userToInvite) {
      return NextResponse.json(
        { error: "User with this email not found" },
        { status: 404 }
      );
    }

    // Verificar si ya es miembro del proyecto
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: userToInvite.id,
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this project" },
        { status: 400 }
      );
    }

    // Agregar usuario al proyecto
    const newMember = await prisma.projectMember.create({
      data: {
        projectId,
        userId: userToInvite.id,
        role,
        invitedBy: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(newMember);
  } catch (error) {
    console.error("Error inviting user to project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const projectId = params.id;

    // Verificar que el usuario es miembro del proyecto
    const currentMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Obtener todos los miembros del proyecto
    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching project members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userIdToRemove = searchParams.get("userId");

    if (!userIdToRemove) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const projectId = params.id;

    // Verificar que el usuario actual es admin o owner del proyecto
    const currentMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: { in: ["OWNER", "ADMIN"] },
      },
    });

    if (!currentMember) {
      return NextResponse.json(
        { error: "You don't have permission to remove users from this project" },
        { status: 403 }
      );
    }

    // No permitir remover al owner del proyecto
    const memberToRemove = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: userIdToRemove,
      },
    });

    if (memberToRemove?.role === "OWNER") {
      return NextResponse.json(
        { error: "Cannot remove the project owner" },
        { status: 400 }
      );
    }

    // Remover miembro del proyecto
    await prisma.projectMember.delete({
      where: {
        id: memberToRemove?.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing project member:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 