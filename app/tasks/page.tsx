import React from 'react'

export default function TasksPage() {
  const columns = [
    { id: 'pending', title: 'Pendientes', color: 'bg-amber-100' },
    { id: 'in-progress', title: 'En Progreso', color: 'bg-sky-100' },
    { id: 'in-review', title: 'En Revisión', color: 'bg-violet-100' },
    { id: 'completed', title: 'Completadas', color: 'bg-green-100' },
  ]

  const tasks = {
    'pending': [
      { id: 1, title: 'Diseñar página de inicio', priority: 'Alta', assignee: 'Juan Pérez', time: '0h' },
      { id: 2, title: 'Configurar servidor', priority: 'Media', assignee: 'María García', time: '0h' },
      { id: 3, title: 'Escribir tests unitarios', priority: 'Baja', assignee: 'Carlos López', time: '0h' },
    ],
    'in-progress': [
      { id: 4, title: 'Implementar autenticación', priority: 'Alta', assignee: 'Ana Rodríguez', time: '3.5h' },
      { id: 5, title: 'Diseño responsive', priority: 'Media', assignee: 'Pedro Martín', time: '2h' },
    ],
    'in-review': [
      { id: 6, title: 'API de usuarios', priority: 'Alta', assignee: 'Laura Sánchez', time: '4h' },
    ],
    'completed': [
      { id: 7, title: 'Setup inicial del proyecto', priority: 'Alta', assignee: 'Juan Pérez', time: '1h' },
      { id: 8, title: 'Configurar base de datos', priority: 'Media', assignee: 'María García', time: '2.5h' },
      { id: 9, title: 'Documentación básica', priority: 'Baja', assignee: 'Carlos López', time: '1.5h' },
    ],
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h1>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
                Todos los Proyectos
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
                Filtros
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
              + Nueva Tarea
            </button>
            <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              Ver Lista
            </button>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.id} className="bg-white rounded-lg shadow-sm">
              {/* Column Header */}
              <div className={`${column.color} px-4 py-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tasks[column.id as keyof typeof tasks]?.length || 0}
                  </span>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 min-h-[600px]">
                {tasks[column.id as keyof typeof tasks]?.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{task.title}</h4>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                        task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-gray-500">{task.time}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {task.assignee.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-gray-600">{task.assignee}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button className="text-gray-400 hover:text-gray-600">
                          <span>💬</span>
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <span>📎</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Task Button */}
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-gray-600 hover:text-gray-700 transition-colors dark:border-gray-600 dark:hover:border-gray-500 dark:hover:text-gray-400">
                  + Agregar tarea
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Creation Modal (placeholder) */}
      <div className="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la tarea
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Escribe el título..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Describe la tarea..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                  <option>Urgente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asignar a
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <option>Juan Pérez</option>
                  <option>María García</option>
                  <option>Carlos López</option>
                  <option>Ana Rodríguez</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Crear Tarea
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 