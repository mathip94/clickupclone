"use client"

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import EditTaskModal from '@/components/modals/EditTaskModal'
import CreateTaskModal from '@/components/modals/CreateTaskModal'
import TaskCard from '@/components/TaskCard'
import ThemeToggle from '@/components/ThemeToggle'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  startDate?: string | null
  dueDate?: string | null
  project: {
    id: string
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

interface Project {
  id: string
  name: string
  color: string
}

export default function TasksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string>('')

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    project: '',
    assignee: '',
    search: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchTasks()
    fetchProjects()
  }, [session, status, router])

  useEffect(() => {
    applyFilters()
  }, [tasks, filters])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const applyFilters = () => {
    let filtered = [...tasks]

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status)
    }

    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority)
    }

    if (filters.project) {
      filtered = filtered.filter(task => task.project.id === filters.project)
    }

    if (filters.assignee) {
      if (filters.assignee === 'unassigned') {
        filtered = filtered.filter(task => !task.assignee)
      } else if (filters.assignee === 'me') {
        filtered = filtered.filter(task => task.assignee?.id === session?.user?.id)
      }
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      )
    }

    setFilteredTasks(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId)
    setShowEditTask(true)
  }

  const handleTaskUpdated = () => {
    setShowEditTask(false)
    setEditingTaskId('')
    fetchTasks()
  }

  const handleTaskCreated = () => {
    setShowCreateTask(false)
    fetchTasks()
  }

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      project: '',
      assignee: '',
      search: ''
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando tareas...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Todas las Tareas</h1>
            <span className="text-gray-600 dark:text-gray-400">
              ({filteredTasks.length} de {tasks.length})
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateTask(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              + Nueva Tarea
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar tareas..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="TODO">Por Hacer</option>
            <option value="IN_PROGRESS">En Progreso</option>
            <option value="IN_REVIEW">En Revisión</option>
            <option value="DONE">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las prioridades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="URGENT">Urgente</option>
          </select>

          <select
            value={filters.project}
            onChange={(e) => handleFilterChange('project', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={filters.assignee}
            onChange={(e) => handleFilterChange('assignee', e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los asignados</option>
            <option value="me">Mis tareas</option>
            <option value="unassigned">Sin asignar</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {tasks.length === 0 ? 'No hay tareas aún' : 'No se encontraron tareas con los filtros aplicados'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {tasks.length === 0 
                ? 'Crea tu primera tarea para comenzar a organizar tu trabajo.' 
                : 'Prueba cambiando los filtros o creando una nueva tarea.'
              }
            </p>
            <button 
              onClick={() => setShowCreateTask(true)}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Crear Nueva Tarea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onStatusChange={handleTaskStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showCreateTask && (
        <CreateTaskModal
          isOpen={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          onTaskCreated={handleTaskCreated}
        />
      )}

      {showEditTask && editingTaskId && (
        <EditTaskModal
          isOpen={showEditTask}
          onClose={() => setShowEditTask(false)}
          onTaskUpdated={handleTaskUpdated}
          taskId={editingTaskId}
        />
      )}
    </div>
  )
} 