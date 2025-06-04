"use client"

import React, { useState, useEffect } from 'react'

interface TimeEntry {
  id: string
  description: string
  duration: number
  startTime: string
  endTime: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface TimeEntriesModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
}

export default function TimeEntriesModal({ isOpen, onClose, taskId, taskTitle }: TimeEntriesModalProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTimeEntries()
    }
  }, [isOpen, taskId])

  const fetchTimeEntries = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/tasks/${taskId}/time-entries`)
      if (response.ok) {
        const data = await response.json()
        setTimeEntries(data)
      } else {
        setError('Error al cargar los registros de tiempo')
      }
    } catch (error) {
      console.error('Error fetching time entries:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`
    } else {
      return `${secs}s`
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalTime = () => {
    return timeEntries.reduce((total, entry) => total + entry.duration, 0)
  }

  const deleteTimeEntry = async (entryId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este registro de tiempo?')) return

    try {
      const response = await fetch(`/api/time-entries/${entryId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setTimeEntries(prev => prev.filter(entry => entry.id !== entryId))
      } else {
        setError('Error al eliminar el registro')
      }
    } catch (error) {
      console.error('Error deleting time entry:', error)
      setError('Error de conexión')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Registros de Tiempo</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">{taskTitle}</p>
          </div>
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

        {/* Summary */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de registros</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{timeEntries.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo total registrado</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatDuration(getTotalTime())}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando registros...</p>
          </div>
        ) : timeEntries.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay registros de tiempo</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Inicia el cronómetro para comenzar a registrar tiempo en esta tarea.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-lg font-mono font-bold text-purple-600 dark:text-purple-400">
                        {formatDuration(entry.duration)}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(entry.startTime)}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 dark:text-white font-medium mb-1">
                      {entry.description || 'Sin descripción'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>Por: {entry.user.name || entry.user.email}</span>
                      <span>
                        Inicio: {formatDateTime(entry.startTime)}
                      </span>
                      <span>
                        Fin: {formatDateTime(entry.endTime)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTimeEntry(entry.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Eliminar registro"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
} 