"use client"

import React, { useState, useEffect } from 'react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onProjectCreated: () => void
}

interface Workspace {
  id: string
  name: string
  color: string
}

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6a6a6a',
    workspaceId: '',
    startDate: '',
    endDate: '',
    isPublic: true
  })
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces()
    }
  }, [isOpen])

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces')
      if (response.ok) {
        const data = await response.json()
        setWorkspaces(data)
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, workspaceId: data[0].id }))
        } else {
          setShowCreateWorkspace(true)
        }
      }
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return

    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newWorkspaceName,
          description: `Workspace de ${newWorkspaceName}`,
        }),
      })

      if (response.ok) {
        const newWorkspace = await response.json()
        setWorkspaces([newWorkspace])
        setFormData(prev => ({ ...prev, workspaceId: newWorkspace.id }))
        setShowCreateWorkspace(false)
        setNewWorkspaceName('')
      } else {
        const data = await response.json()
        setError(data.error || 'Error al crear el workspace')
      }
    } catch (error) {
      setError('Error de conexión. Inténtalo de nuevo.')
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
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
          endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onProjectCreated()
        setFormData({
          name: '',
          description: '',
          color: '#6a6a6a',
          workspaceId: '',
          startDate: '',
          endDate: '',
          isPublic: true
        })
      } else {
        setError(data.error || 'Error al crear el proyecto')
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
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {showCreateWorkspace ? 'Crear Workspace' : 'Crear Nuevo Proyecto'}
          </h2>
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

        {showCreateWorkspace ? (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Necesitas crear un workspace primero para organizar tus proyectos.
            </p>
            <div>
              <label htmlFor="workspaceName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Workspace *
              </label>
              <input
                type="text"
                id="workspaceName"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Mi Empresa"
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={createWorkspace}
                disabled={!newWorkspaceName.trim() || isLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Crear Workspace
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Proyecto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ej: Aplicación Web"
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
                placeholder="Descripción del proyecto..."
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="workspaceId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Espacio de Trabajo *
              </label>
              <div className="flex space-x-2">
                <select
                  id="workspaceId"
                  name="workspaceId"
                  required
                  value={formData.workspaceId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                >
                  <option value="">Seleccionar workspace...</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateWorkspace(true)}
                  className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-600 dark:border-gray-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                  disabled={isLoading}
                >
                  + Nuevo
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color del Proyecto
              </label>
              <div className="flex space-x-2">
                {['#6a6a6a', '#FF6B6B', '#4ECDC4', '#2d2d2d', '#96CEB4', '#FFEAA7', '#8a8a8a', '#98D8C8'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-gray-900 dark:border-white' : 'border-gray-300 dark:border-gray-600'}`}
                    style={{ backgroundColor: color }}
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
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
                disabled={isLoading || !formData.name}
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {isLoading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
} 