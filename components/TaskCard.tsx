"use client"

import React, { useState } from 'react'
import TaskTimer from './TaskTimer'
import TimeEntriesModal from './TimeEntriesModal'
import CommentsModal from './CommentsModal'
import ManualTimeEntryModal from './modals/ManualTimeEntryModal'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description?: string
    status: string
    priority: string
    startDate?: string | null
    dueDate?: string | null
    project: {
      name: string
      color: string
    }
    assignee?: {
      id: string
      name: string
      email: string
    } | null
    _count: {
      comments: number
      timeEntries: number
    }
  }
  onEdit: (taskId: string) => void
  onStatusChange?: (taskId: string, newStatus: string) => void
}

const statusOptions = [
  { value: 'TODO', label: '📋 Por Hacer', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' },
  { value: 'IN_PROGRESS', label: '⏳ En Progreso', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200' },
  { value: 'IN_REVIEW', label: '👀 En Revisión', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200' },
  { value: 'DONE', label: '✅ Completada', color: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200' },
  { value: 'CANCELLED', label: '❌ Cancelada', color: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' }
]

const priorityOptions = [
  { value: 'LOW', label: '🟢', color: 'text-green-500' },
  { value: 'MEDIUM', label: '🟡', color: 'text-yellow-500' },
  { value: 'HIGH', label: '🟠', color: 'text-orange-500' },
  { value: 'URGENT', label: '🔴', color: 'text-red-500' }
]

export default function TaskCard({ task, onEdit, onStatusChange }: TaskCardProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [showTimeEntries, setShowTimeEntries] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showManualTimeEntry, setShowManualTimeEntry] = useState(false)

  const getPriorityInfo = (priority: string) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1]
  }

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return

    setIsUpdatingStatus(true)
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok && onStatusChange) {
        onStatusChange(task.id, newStatus)
      }
    } catch (error) {
      console.error('Error updating task status:', error)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleManualTimeSuccess = () => {
    setShowManualTimeEntry(false)
    // Aquí podrías refrescar los datos de la tarea si es necesario
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && task.status !== 'DONE'
  }

  const priorityInfo = getPriorityInfo(task.priority)
  const statusInfo = getStatusInfo(task.status)

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: task.project.color }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</span>
            <span className={`text-sm ${priorityInfo.color}`}>
              {priorityInfo.label}
            </span>
          </div>
          <button
            onClick={() => onEdit(task.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            title="Editar tarea"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
          {task.title}
        </h3>

        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Status Dropdown */}
        <div className="mb-3">
          <select
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusInfo.color} ${
              isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        {(task.startDate || task.dueDate) && (
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
            {task.startDate && (
              <span>Inicio: {formatDate(task.startDate)}</span>
            )}
            {task.dueDate && (
              <span className={isOverdue(task.dueDate) ? 'text-red-500 font-medium' : ''}>
                Vence: {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        )}

        {/* Assignee */}
        {task.assignee && (
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-6 h-6 bg-gray-600 dark:bg-gray-300 rounded-full flex items-center justify-center text-white dark:text-gray-900 text-xs font-medium">
              {task.assignee.name ? task.assignee.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {task.assignee.name || task.assignee.email}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowComments(true)}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Ver comentarios"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>{task._count.comments}</span>
            </button>
            <button
              onClick={() => setShowTimeEntries(true)}
              className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              title="Ver registros de tiempo"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{task._count.timeEntries}</span>
            </button>
            <button
              onClick={() => setShowManualTimeEntry(true)}
              className="flex items-center space-x-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
              title="Registrar tiempo manual"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>⏱️</span>
            </button>
          </div>
        </div>

        {/* Timer */}
        <TaskTimer taskId={task.id} />
      </div>

      {/* Modales */}
      {showTimeEntries && (
        <TimeEntriesModal
          isOpen={showTimeEntries}
          onClose={() => setShowTimeEntries(false)}
          taskId={task.id}
          taskTitle={task.title}
        />
      )}

      {showComments && (
        <CommentsModal
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          taskId={task.id}
          taskTitle={task.title}
        />
      )}

      {showManualTimeEntry && (
        <ManualTimeEntryModal
          isOpen={showManualTimeEntry}
          onClose={() => setShowManualTimeEntry(false)}
          taskId={task.id}
          onSuccess={handleManualTimeSuccess}
        />
      )}
    </>
  )
} 