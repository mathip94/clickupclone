"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Users, MapPin, Building, Video } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
}

const meetingTypes = [
  { value: "COMPANY", label: "Empresa", icon: Building },
  { value: "TEAM", label: "Equipo", icon: Users },
  { value: "TUTORING", label: "Tutoría", icon: Calendar },
  { value: "OTHER", label: "Otros", icon: Calendar },
];

const locations = [
  { value: "REMOTE", label: "Remota" },
  { value: "IN_PERSON", label: "En persona" },
];

export default function CreateMeetingModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
}: CreateMeetingModalProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    type: "TEAM" as "COMPANY" | "TEAM" | "TUTORING" | "OTHER",
    location: "REMOTE" as "REMOTE" | "IN_PERSON",
    projectId: projectId || "",
    attendeeIds: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (projectId) {
      setFormData(prev => ({ ...prev, projectId }));
    }
  }, [projectId]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const [projectsRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/workspaces/current/members"),
      ]);

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.map((member: any) => member.user));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.date || !formData.time || !formData.projectId) {
        alert("Por favor completa todos los campos requeridos");
        return;
      }

      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          date: dateTime.toISOString(),
          duration: formData.duration,
          type: formData.type,
          location: formData.location,
          projectId: formData.projectId,
          attendeeIds: formData.attendeeIds,
        }),
      });

      if (response.ok) {
        onSuccess();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || "Error al crear reunión");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear reunión");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      type: "TEAM",
      location: "REMOTE",
      projectId: projectId || "",
      attendeeIds: [],
    });
  };

  const handleAttendeeToggle = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendeeIds: prev.attendeeIds.includes(userId)
        ? prev.attendeeIds.filter(id => id !== userId)
        : [...prev.attendeeIds, userId]
    }));
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Crear Nueva Reunión
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando datos...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nombre de la reunión */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la reunión *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Ej. Reunión de planificación semanal"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Agenda y objetivos de la reunión..."
              />
            </div>

            {/* Fecha y hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hora *
                </label>
                <input
                  type="time"
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Duración */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duración: {formatDuration(formData.duration)}
              </label>
              <input
                type="range"
                id="duration"
                min="15"
                max="480"
                step="15"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>15m</span>
                <span>8h</span>
              </div>
            </div>

            {/* Tipo y ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de reunión
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="TEAM">Equipo</option>
                  <option value="COMPANY">Empresa</option>
                  <option value="TUTORING">Tutoría</option>
                  <option value="OTHER">Otros</option>
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modalidad
                </label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="REMOTE">Remota</option>
                  <option value="IN_PERSON">En persona</option>
                </select>
              </div>
            </div>

            {/* Proyecto */}
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Proyecto *
              </label>
              <select
                id="project"
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Seleccionar proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Participantes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Participantes
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
                {users.length === 0 ? (
                  <p className="p-3 text-sm text-gray-500 dark:text-gray-400">No hay usuarios disponibles</p>
                ) : (
                  users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 border-b border-gray-200 dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.attendeeIds.includes(user.id)}
                        onChange={() => handleAttendeeToggle(user.id)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {formData.attendeeIds.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formData.attendeeIds.length} participante(s) seleccionado(s)
                </p>
              )}
            </div>

            {/* Botones */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creando..." : "Crear Reunión"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 