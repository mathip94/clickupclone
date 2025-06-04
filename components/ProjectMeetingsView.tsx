"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, Plus, X, Building, Video, User as UserIcon } from "lucide-react";
import CreateMeetingModal from "./modals/CreateMeetingModal";

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

interface ProjectMeetingsViewProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
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

const typeColors = {
  COMPANY: "text-slate-700 bg-slate-200 dark:text-slate-300 dark:bg-slate-700",
  TEAM: "text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-800", 
  TUTORING: "text-orange-700 bg-orange-100 dark:text-orange-300 dark:bg-orange-800",
  OTHER: "text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-800",
};

const locationIcons = {
  REMOTE: Video,
  IN_PERSON: MapPin,
};

const locationLabels = {
  REMOTE: "Remota",
  IN_PERSON: "En persona",
};

export default function ProjectMeetingsView({
  projectId,
  projectName,
  onClose,
}: ProjectMeetingsViewProps) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, [projectId]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/meetings?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      } else {
        setError("Error al cargar reuniones del proyecto");
      }
    } catch (error) {
      setError("Error al cargar reuniones del proyecto");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchMeetings(); // Refrescar lista de reuniones
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const groupMeetingsByDate = (meetings: Meeting[]) => {
    const groups: { [key: string]: Meeting[] } = {};
    
    meetings.forEach((meeting) => {
      const dateKey = new Date(meeting.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(meeting);
    });

    // Ordenar por fecha y luego por hora
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
            <span className="text-gray-900 dark:text-white">Cargando reuniones...</span>
          </div>
        </div>
      </div>
    );
  }

  const groupedMeetings = groupMeetingsByDate(meetings);
  const sortedDateKeys = Object.keys(groupedMeetings).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reuniones del Proyecto</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projectName}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Nueva Reunión</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            {error && (
              <div className="p-4 m-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded">
                {error}
              </div>
            )}

            <div className="p-6">
              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay reuniones en este proyecto
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Comienza programando tu primera reunión para este proyecto.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Crear Primera Reunión</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDateKeys.map((dateKey) => {
                    const dateMeetings = groupedMeetings[dateKey];
                    const isToday = isMeetingToday(dateMeetings[0].date);
                    
                    return (
                      <div key={dateKey}>
                        <div className={`flex items-center space-x-2 mb-4 ${
                          isToday ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          <Calendar className="h-4 w-4" />
                          <h3 className="font-medium">
                            {formatDate(dateMeetings[0].date)}
                            {isToday && " (Hoy)"}
                          </h3>
                        </div>
                        
                        <div className="grid gap-4 ml-6">
                          {dateMeetings.map((meeting) => {
                            const TypeIcon = typeIcons[meeting.type];
                            const LocationIcon = locationIcons[meeting.location];
                            const isPast = isMeetingPast(meeting.date);
                            
                            return (
                              <div
                                key={meeting.id}
                                className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-all ${
                                  isPast ? 'opacity-75' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-3">
                                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                                        {meeting.name}
                                      </h4>
                                      <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                          typeColors[meeting.type]
                                        }`}
                                      >
                                        <TypeIcon className="h-3 w-3 mr-1" />
                                        {typeLabels[meeting.type]}
                                      </span>
                                      {isPast && (
                                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-full">
                                          Finalizada
                                        </span>
                                      )}
                                    </div>
                                    
                                    {meeting.description && (
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        {meeting.description}
                                      </p>
                                    )}
                                    
                                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{meeting.attendees.length} participantes</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <div 
                                          className="w-3 h-3 rounded-full"
                                          style={{ backgroundColor: meeting.project.color }}
                                        />
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                          {meeting.project.name}
                                        </span>
                                      </div>
                                      
                                      {meeting.attendees.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                          <UserIcon className="h-3 w-3 text-gray-400" />
                                          <div className="flex flex-wrap gap-1">
                                            {meeting.attendees.slice(0, 3).map((attendee) => (
                                              <span
                                                key={attendee.id}
                                                className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-2 py-1 rounded-full"
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
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          projectId={projectId}
        />
      )}
    </>
  );
} 