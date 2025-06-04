import React from 'react'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              + Nueva Tarea
            </button>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">En Progreso</p>
                <p className="text-3xl font-bold text-blue-600">8</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-green-600">12</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Hoy</p>
                <p className="text-3xl font-bold text-purple-600">6.5h</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⏰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Tareas Recientes</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { title: "Diseñar interfaz de usuario", status: "En Progreso", priority: "Alta", time: "2h" },
                  { title: "Implementar autenticación", status: "Completada", priority: "Media", time: "4h" },
                  { title: "Configurar base de datos", status: "Por Hacer", priority: "Alta", time: "0h" },
                  { title: "Escribir documentación", status: "En Revisión", priority: "Baja", time: "1.5h" },
                ].map((task, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.title}</h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.status === 'Completada' ? 'bg-green-100 text-green-800' :
                          task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'En Revisión' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          task.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                          task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">{task.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Overview */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Proyectos Activos</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { name: "Aplicación Web ClickUp", progress: 75, tasks: 12, color: "purple" },
                  { name: "Sitio Web Corporativo", progress: 45, tasks: 8, color: "blue" },
                  { name: "App Mobile", progress: 30, tasks: 15, color: "green" },
                  { name: "Dashboard Analytics", progress: 90, tasks: 6, color: "orange" },
                ].map((project, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className="text-sm text-gray-500">{project.tasks} tareas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${
                          project.color === 'purple' ? 'bg-purple-600' :
                          project.color === 'blue' ? 'bg-blue-600' :
                          project.color === 'green' ? 'bg-green-600' :
                          'bg-orange-600'
                        }`}
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.progress}% completado</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 text-center bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="text-2xl mb-2">📝</div>
              <div className="text-sm font-medium text-gray-900">Nueva Tarea</div>
            </button>
            <button className="p-4 text-center bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm font-medium text-gray-900">Nuevo Proyecto</div>
            </button>
            <button className="p-4 text-center bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="text-2xl mb-2">⏱️</div>
              <div className="text-sm font-medium text-gray-900">Cronómetro</div>
            </button>
            <button className="p-4 text-center bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-900">Reportes</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 