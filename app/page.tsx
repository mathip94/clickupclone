"use client"

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Aún cargando
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return null // Evita parpadeo mientras redirige
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white mb-16">
          <h1 className="text-6xl font-bold mb-6">
            ClickUp Clone
          </h1>
          <p className="text-xl mb-8 opacity-90">
            La mejor aplicación de gestión de proyectos para tu equipo
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/login"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold mb-3">Gestión de Proyectos</h3>
            <p className="opacity-90">
              Organiza y administra todos tus proyectos en un solo lugar con herramientas intuitivas.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold mb-3">Seguimiento de Tiempo</h3>
            <p className="opacity-90">
              Registra el tiempo dedicado a cada tarea y obtén insights sobre la productividad.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-white">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold mb-3">Colaboración en Equipo</h3>
            <p className="opacity-90">
              Asigna tareas, colabora en tiempo real y mantén a todo el equipo sincronizado.
            </p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Características Principales</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="text-green-400 text-xl">✅</div>
              <div>
                <h4 className="font-semibold mb-1">Gestión de Tareas</h4>
                <p className="opacity-90 text-sm">Crea, asigna y da seguimiento a tareas con estados personalizables</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-gray-600 dark:text-gray-400 text-xl">📊</div>
              <div>
                <h4 className="font-semibold mb-1">Dashboard Analítico</h4>
                <p className="opacity-90 text-sm">Visualiza el progreso con gráficos y métricas en tiempo real</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-yellow-400 text-xl">🏷️</div>
              <div>
                <h4 className="font-semibold mb-1">Etiquetas y Prioridades</h4>
                <p className="opacity-90 text-sm">Organiza tareas con etiquetas y niveles de prioridad</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-gray-600 dark:text-gray-400 text-xl">💬</div>
              <div>
                <h4 className="font-semibold mb-1">Comentarios y Colaboración</h4>
                <p className="opacity-90 text-sm">Comenta en tareas y mantén conversaciones contextuales</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 