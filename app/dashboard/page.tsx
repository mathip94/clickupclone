"use client"

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Modales para crear proyectos y tareas
import CreateProjectModal from '@/components/modals/CreateProjectModal'
import CreateTaskModal from '@/components/modals/CreateTaskModal'
import EditTaskModal from '@/components/modals/EditTaskModal'
import TaskCard from '@/components/TaskCard'
import ThemeToggle from '@/components/ThemeToggle'
import ProjectMembersView from '@/components/ProjectMembersView'
import ProjectMeetingsView from '@/components/ProjectMeetingsView'
import NotificationCenter from '@/components/NotificationCenter'

interface DashboardStats {
  totalTasks: number
  inProgressTasks: number
  completedTasks: number
  todoTasks: number
  todayTime: number
  totalProjects: number
  activeProjects: number
  recentTasks: any[]
  projects: any[]
}

interface Task {
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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardStats>({
    totalTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0,
    todoTasks: 0,
    todayTime: 0,
    totalProjects: 0,
    activeProjects: 0,
    recentTasks: [],
    projects: []
  })
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showEditTask, setShowEditTask] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState<string>('')
  
  // Nuevos estados para las vistas
  const [showProjectMembers, setShowProjectMembers] = useState(false)
  const [showProjectMeetings, setShowProjectMeetings] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  // Redirigir si no está autenticado
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    initializeUserData()
  }, [session, status, router])

  // Actualizar tiempo total calculado desde localStorage
  useEffect(() => {
    const updateTodayTime = () => {
      const today = new Date().toDateString()
      let totalTime = 0
      
      // Iterar sobre todas las claves de localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('taskTime_') && key.endsWith(`_${today}`)) {
          const time = localStorage.getItem(key)
          if (time) {
            totalTime += parseInt(time)
          }
        }
      }
      
      setDashboardData(prev => ({
        ...prev,
        todayTime: Math.round(totalTime / 3600 * 100) / 100 // Convertir a horas con 2 decimales
      }))
    }

    updateTodayTime()
    // Actualizar cada 30 segundos
    const interval = setInterval(updateTodayTime, 30000)
    return () => clearInterval(interval)
  }, [])

  const initializeUserData = async () => {
    try {
      // Primero asegurar que el usuario tenga un workspace
      await fetch('/api/user/ensure-workspace', { method: 'POST' })
      
      // Luego cargar los datos del dashboard
      await fetchDashboardData()
      await fetchTasks()
    } catch (error) {
      console.error('Error initializing user data:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  const handleProjectCreated = () => {
    setShowCreateProject(false)
    fetchDashboardData() // Recargar datos
  }

  const handleTaskCreated = () => {
    setShowCreateTask(false)
    fetchDashboardData() // Recargar datos
    fetchTasks() // Recargar tareas
  }

  const handleTaskUpdated = () => {
    setShowEditTask(false)
    setEditingTaskId('')
    fetchDashboardData() // Recargar datos
    fetchTasks() // Recargar tareas
  }

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId)
    setShowEditTask(true)
  }

  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    // Actualizar la tarea en el estado local inmediatamente
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ))
    
    // Recargar datos del dashboard para actualizar contadores
    fetchDashboardData()
  }

  const handleProjectAction = (project: any, action: 'members' | 'meetings') => {
    setSelectedProject(project)
    if (action === 'members') {
      setShowProjectMembers(true)
    } else if (action === 'meetings') {
      setShowProjectMeetings(true)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
      case 'IN_PROGRESS': return 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200'
      case 'IN_REVIEW': return 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
      case 'TODO': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
      default: return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <span className="text-gray-600 dark:text-gray-400">
              ¡Bienvenido, {session.user?.name || session.user?.email}!
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowCreateTask(true)}
              className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              + Nueva Tarea
            </button>
            <NotificationCenter />
            <ThemeToggle />
            <div className="relative">
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="w-8 h-8 bg-gray-600 dark:bg-gray-300 rounded-full flex items-center justify-center text-white dark:text-gray-900 font-semibold">
                  {session.user?.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tareas Totales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{dashboardData.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En Progreso</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-300">{dashboardData.inProgressTasks}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{dashboardData.completedTasks}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tiempo Hoy</p>
                <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{dashboardData.todayTime}h</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-400 text-xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Getting Started Message or Welcome */}
        {dashboardData.totalTasks === 0 && dashboardData.totalProjects === 0 ? (
          <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-2">¡Comienza a gestionar tus proyectos!</h2>
            <p className="text-gray-100 mb-4">
              Bienvenido a ClickUp Clone. Crea tu primer proyecto y comienza a organizar tus tareas.
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={() => setShowCreateProject(true)}
                className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
              >
                Crear Primer Proyecto
              </button>
              <button className="border border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors">
                Ver Tutorial
              </button>
            </div>
          </div>
        ) : null}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="p-6 border-b dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mis Tareas</h2>
              </div>
              <div className="p-6">
                {tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay tareas aún</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Crea tu primera tarea para comenzar a organizar tu trabajo.</p>
                    <button 
                      onClick={() => setShowCreateTask(true)}
                      className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      Crear Primera Tarea
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tasks.slice(0, 6).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onStatusChange={handleTaskStatusChange}
                      />
                    ))}
                    {tasks.length > 6 && (
                      <div className="text-center py-4">
                        <button 
                          onClick={() => router.push('/dashboard/tasks')}
                          className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                          Ver todas las tareas ({tasks.length - 6} más)
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Proyectos Activos</h2>
            </div>
            <div className="p-6">
              {dashboardData.projects.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay proyectos aún</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Crea tu primer proyecto para comenzar a organizar tus tareas.</p>
                  <button 
                    onClick={() => setShowCreateProject(true)}
                    className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  >
                    Crear Primer Proyecto
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData.projects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">{project.name}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 dark:text-gray-400">{project.totalTasks} tareas</span>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleProjectAction(project, 'members')}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Ver miembros"
                            >
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857M15 11a3 3 0 11-6 0 3 3 0 016 0zm6 0a3 3 0 11-6 0 3 3 0 016 0zm-12 0a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleProjectAction(project, 'meetings')}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                              title="Ver reuniones"
                            >
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-2">
                        <div 
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${project.progress}%`,
                            backgroundColor: project.color 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{project.progress}% completado</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowCreateTask(true)}
              className="p-4 text-center bg-sky-50 dark:bg-sky-900 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-800 transition-colors"
            >
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium text-sky-800 dark:text-sky-200">Nueva Tarea</div>
            </button>
            <button 
              onClick={() => setShowCreateProject(true)}
              className="p-4 text-center bg-violet-50 dark:bg-violet-900 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-800 transition-colors"
            >
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium text-violet-800 dark:text-violet-200">Nuevo Proyecto</div>
            </button>
            <button 
              onClick={() => router.push('/dashboard/meetings')}
              className="p-4 text-center bg-emerald-50 dark:bg-emerald-900 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800 transition-colors"
            >
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium text-emerald-800 dark:text-emerald-200">Reuniones</div>
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showCreateProject && (
        <CreateProjectModal
          isOpen={showCreateProject}
          onClose={() => setShowCreateProject(false)}
          onProjectCreated={handleProjectCreated}
        />
      )}

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

      {/* Nuevas vistas */}
      {showProjectMembers && selectedProject && (
        <ProjectMembersView
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          userRole="OWNER"
          onClose={() => {
            setShowProjectMembers(false)
            setSelectedProject(null)
          }}
        />
      )}

      {showProjectMeetings && selectedProject && (
        <ProjectMeetingsView
          projectId={selectedProject.id}
          projectName={selectedProject.name}
          onClose={() => {
            setShowProjectMeetings(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
} 