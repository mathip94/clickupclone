"use client"

import React, { useState, useEffect } from 'react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onTaskCreated: () => void
}

interface Project {
  id: string
  name: string
  color: string
  workspaceId: string
  workspace: { name: string }
}

interface WorkspaceMember {
  id: string
  role: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function CreateTaskModal({ isOpen, onClose, onTaskCreated }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: 'MEDIUM',
    status: 'TODO',
    startDate: '',
    dueDate: ''
  })
  const [projects, setProjects] = useState<Project[]>([])
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.projectId) {
      fetchWorkspaceMembers()
    }
  }, [formData.projectId])

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, projectId: data[0].id }))
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchWorkspaceMembers = async () => {
    if (!formData.projectId) return

    try {
      const selectedProject = projects.find(p => p.id === formData.projectId)
      if (!selectedProject) return

      const response = await fetch(`/api/workspaces/${selectedProject.workspaceId}/members`)
      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Error fetching workspace members:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          assigneeId: formData.assigneeId || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onTaskCreated()
        setFormData({
          title: '',
          description: '',
          projectId: '',
          assigneeId: '',
          priority: 'MEDIUM',
          status: 'TODO',
          startDate: '',
          dueDate: ''
        })
      } else {
        setError(data.error || 'Error al crear la tarea')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Crear Nueva Tarea</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título de la Tarea *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Ej: Implementar sistema de autenticación"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descripción detallada de la tarea..."
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proyecto *
              </label>
              <select
                id="projectId"
                name="projectId"
                required
                value={formData.projectId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Seleccionar proyecto...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asignar a
              </label>
              <select
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="">Sin asignar</option>
                {members.map((member) => (
                  <option key={member.user.id} value={member.user.id}>
                    {member.user.name || member.user.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Prioridad
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="LOW">🟢 Baja</option>
                <option value="MEDIUM">🟡 Media</option>
                <option value="HIGH">🟠 Alta</option>
                <option value="URGENT">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="TODO">📋 Por Hacer</option>
                <option value="IN_PROGRESS">⏳ En Progreso</option>
                <option value="IN_REVIEW">👀 En Revisión</option>
                <option value="DONE">✅ Completada</option>
                <option value="CANCELLED">❌ Cancelada</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Límite
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title || !formData.projectId}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creando...' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 