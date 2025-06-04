"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, MapPin, Plus, ArrowLeft, Building, Video, User as UserIcon, FolderOpen } from "lucide-react";
import CreateMeetingModal from "@/components/modals/CreateMeetingModal";

interface Meeting {
  id: string;
  name: string;
  description?: string;
  date: string;
  duration: number;
  type: "COMPANY" | "TEAM" | "TUTORING" | "OTHER";
  location: "REMOTE" | "IN_PERSON";
  createdAt: string;
  project: {
    id: string;
    name: string;
    color: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  attendees: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  meetings: Meeting[];
}

const typeIcons = {
  COMPANY: Building,
  TEAM: Users,
  TUTORING: Calendar,
  OTHER: Calendar,
};

const typeLabels = {
  COMPANY: "Empresa",
  TEAM: "Equipo",
  TUTORING: "Tutoría",
  OTHER: "Otros",
};

const meetingTypeColors = {
  COMPANY: "text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-700",
  TEAM: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-800",
  TUTORING: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-800",
  OTHER: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-800"
};

const locationIcons = {
  REMOTE: Video,
  IN_PERSON: MapPin,
};

const locationLabels = {
  REMOTE: "Remota",
  IN_PERSON: "En persona",
};

export default function MeetingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (session) {
      fetchProjectsWithMeetings();
    }
  }, [session]);

  const fetchProjectsWithMeetings = async () => {
    try {
      setLoading(true);
      setError("");

      // Primero obtenemos los proyectos del usuario
      const projectsResponse = await fetch("/api/projects");
      if (!projectsResponse.ok) {
        throw new Error("Error al cargar proyectos");
      }
      
      const userProjects = await projectsResponse.json();
      
      // Para cada proyecto, obtenemos sus reuniones
      const projectsWithMeetings = await Promise.all(
        userProjects.map(async (project: any) => {
          try {
            const meetingsResponse = await fetch(`/api/meetings?projectId=${project.id}`);
            if (meetingsResponse.ok) {
              const meetings = await meetingsResponse.json();
              return {
                ...project,
                meetings: meetings || []
              };
            } else {
              return {
                ...project,
                meetings: []
              };
            }
          } catch (error) {
            console.error(`Error fetching meetings for project ${project.id}:`, error);
            return {
              ...project,
              meetings: []
            };
          }
        })
      );

      setProjects(projectsWithMeetings);
      
      // Expandir automáticamente proyectos que tienen reuniones
      const projectsWithMeetingsIds = projectsWithMeetings
        .filter(project => project.meetings.length > 0)
        .map(project => project.id);
      setExpandedProjects(new Set(projectsWithMeetingsIds));
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Error al cargar reuniones. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchProjectsWithMeetings();
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const isMeetingPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  const isMeetingToday = (dateString: string) => {
    const meetingDate = new Date(dateString);
    const today = new Date();
    return (
      meetingDate.getDate() === today.getDate() &&
      meetingDate.getMonth() === today.getMonth() &&
      meetingDate.getFullYear() === today.getFullYear()
    );
  };

  const getTotalMeetings = () => {
    return projects.reduce((total, project) => total + project.meetings.length, 0);
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return projects.reduce((total, project) => {
      return total + project.meetings.filter(meeting => new Date(meeting.date) > now).length;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando reuniones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Gestión de Reuniones</h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Reunión</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="p-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Reuniones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{getTotalMeetings()}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Próximas</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{getUpcomingMeetings()}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proyectos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{projects.length}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tienes proyectos con reuniones
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Crea tu primera reunión en uno de tus proyectos para comenzar a organizar tus encuentros.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Crear Primera Reunión</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const isExpanded = expandedProjects.has(project.id);
              const meetingCount = project.meetings.length;
              
              return (
                <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* Project Header */}
                  <div 
                    className="p-6 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleProjectExpansion(project.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {meetingCount} {meetingCount === 1 ? 'reunión' : 'reuniones'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowCreateModal(true);
                          }}
                          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center space-x-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Nueva</span>
                        </button>
                        <div className={`transform transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Project Meetings */}
                  {isExpanded && (
                    <div className="p-6">
                      {meetingCount === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500 dark:text-gray-400 mb-3">
                            No hay reuniones programadas en este proyecto
                          </p>
                          <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            Crear primera reunión
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {project.meetings.map((meeting) => {
                            const TypeIcon = typeIcons[meeting.type];
                            const LocationIcon = locationIcons[meeting.location];
                            const isPast = isMeetingPast(meeting.date);
                            const isToday = isMeetingToday(meeting.date);
                            
                            return (
                              <div
                                key={meeting.id}
                                className={`border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all ${
                                  isPast ? 'opacity-75' : ''
                                } ${isToday ? 'ring-2 ring-gray-500 dark:ring-gray-400' : ''}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                      <h4 className="text-base font-medium text-gray-900 dark:text-white">
                                        {meeting.name}
                                      </h4>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          meetingTypeColors[meeting.type]
                                        }`}
                                      >
                                        <TypeIcon className="h-3 w-3 mr-1" />
                                        {typeLabels[meeting.type]}
                                      </span>
                                      {isPast && (
                                        <span className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                                          Finalizada
                                        </span>
                                      )}
                                      {isToday && (
                                        <span className="text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 px-2 py-1 rounded-full font-medium">
                                          Hoy
                                        </span>
                                      )}
                                    </div>
                                    
                                    {meeting.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                        {meeting.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(meeting.date)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatTime(meeting.date)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDuration(meeting.duration)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <LocationIcon className="h-4 w-4" />
                                        <span>{locationLabels[meeting.location]}</span>
                                      </div>
                                    </div>

                                    {meeting.attendees.length > 0 && (
                                      <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-gray-400" />
                                        <div className="flex flex-wrap gap-1">
                                          {meeting.attendees.slice(0, 3).map((attendee) => (
                                            <span
                                              key={attendee.id}
                                              className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 px-2 py-1 rounded-full"
                                            >
                                              {attendee.user.name}
                                            </span>
                                          ))}
                                          {meeting.attendees.length > 3 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                              +{meeting.attendees.length - 3} más
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
} 