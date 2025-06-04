import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createMeetingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z.string().datetime(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  type: z.enum(["COMPANY", "TEAM", "TUTORING", "OTHER"]),
  location: z.enum(["REMOTE", "IN_PERSON"]),
  projectId: z.string().min(1, "Project ID is required"),
  attendeeIds: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createMeetingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid data", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { name, description, date, duration, type, location, projectId, attendeeIds = [] } = validation.data;

    // Verificar que el usuario es miembro del proyecto
    const projectMember = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    });

    if (!projectMember) {
      return NextResponse.json(
        { error: "You are not a member of this project" },
        { status: 403 }
      );
    }

    // Verificar que todos los attendees son miembros del proyecto
    if (attendeeIds.length > 0) {
      const validAttendees = await prisma.projectMember.findMany({
        where: {
          projectId,
          userId: { in: attendeeIds },
        },
      });

      if (validAttendees.length !== attendeeIds.length) {
        return NextResponse.json(
          { error: "Some attendees are not members of this project" },
          { status: 400 }
        );
      }
    }

    // Crear la meeting con attendees
    const meeting = await prisma.meeting.create({
      data: {
        name,
        description,
        date: new Date(date),
        duration,
        type,
        location,
        projectId,
        createdById: session.user.id,
        attendees: {
          create: attendeeIds.map(userId => ({ userId })),
        },
      },
      include: {
        project: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (projectId) {
      // Obtener reuniones de un proyecto específico
      const projectMember = await prisma.projectMember.findFirst({
        where: {
          projectId,
          userId: session.user.id,
        },
      });

      if (!projectMember) {
        return NextResponse.json(
          { error: "You are not a member of this project" },
          { status: 403 }
        );
      }

      const meetings = await prisma.meeting.findMany({
        where: { projectId },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          attendees: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: { date: "desc" },
      });

      return NextResponse.json(meetings);
    } else {
      // Obtener todas las reuniones del usuario agrupadas por proyecto
      const userProjects = await prisma.projectMember.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          projectId: true,
        },
      });

      const projectIds = userProjects.map(pm => pm.projectId);

      const projects = await prisma.project.findMany({
        where: {
          id: { in: projectIds }
        },
        include: {
          meetings: {
            include: {
              project: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              attendees: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
            orderBy: { date: "desc" },
          },
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 