"use client"

import React, { useState, useEffect, useRef } from 'react'

interface TaskTimerProps {
  taskId: string
  onTimeUpdate?: (seconds: number) => void
}

interface ActiveTimer {
  taskId: string
  startTime: number
  description: string
}

export default function TaskTimer({ taskId, onTimeUpdate }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [description, setDescription] = useState('')
  const [todayTime, setTodayTime] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cargar tiempo acumulado de hoy para esta tarea
    loadTodayTime()
    
    // Verificar si hay un timer activo para esta tarea
    const activeTimer = getActiveTimer()
    if (activeTimer && activeTimer.taskId === taskId) {
      const elapsed = Math.floor((Date.now() - activeTimer.startTime) / 1000)
      setElapsedTime(elapsed)
      setDescription(activeTimer.description)
      setIsRunning(true)
      startInterval()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [taskId])

  const loadTodayTime = () => {
    try {
      const today = new Date().toDateString()
      const savedTime = localStorage.getItem(`taskTime_${taskId}_${today}`)
      if (savedTime) {
        const time = parseInt(savedTime, 10)
        if (!isNaN(time)) {
          setTodayTime(time)
        }
      }
    } catch (error) {
      console.error('Error loading today time:', error)
    }
  }

  const saveTodayTime = (seconds: number) => {
    try {
      const today = new Date().toDateString()
      const currentTime = todayTime + seconds
      localStorage.setItem(`taskTime_${taskId}_${today}`, currentTime.toString())
      setTodayTime(currentTime)
      
      // Notificar al componente padre sobre la actualización de tiempo
      if (onTimeUpdate) {
        onTimeUpdate(currentTime)
      }
    } catch (error) {
      console.error('Error saving today time:', error)
    }
  }

  const getActiveTimer = (): ActiveTimer | null => {
    try {
      const activeTimer = localStorage.getItem('activeTaskTimer')
      return activeTimer ? JSON.parse(activeTimer) : null
    } catch (error) {
      console.error('Error getting active timer:', error)
      return null
    }
  }

  const setActiveTimer = (timer: ActiveTimer | null) => {
    try {
      if (timer) {
        localStorage.setItem('activeTaskTimer', JSON.stringify(timer))
      } else {
        localStorage.removeItem('activeTaskTimer')
      }
    } catch (error) {
      console.error('Error setting active timer:', error)
    }
  }

  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    intervalRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)
  }

  const handleStart = () => {
    try {
      // Solo puede haber un timer activo a la vez
      const existingTimer = getActiveTimer()
      if (existingTimer && existingTimer.taskId !== taskId) {
        alert('Ya hay un cronómetro activo en otra tarea. Detén el cronómetro actual primero.')
        return
      }

      setIsRunning(true)
      setElapsedTime(0)
      
      const timer: ActiveTimer = {
        taskId,
        startTime: Date.now(),
        description: description || ''
      }
      setActiveTimer(timer)
      startInterval()
    } catch (error) {
      console.error('Error starting timer:', error)
    }
  }

  const handleStop = async () => {
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }

      setIsRunning(false)
      setActiveTimer(null)
      setIsSaving(true)

      // Guardar la entrada de tiempo en la base de datos solo si hay tiempo transcurrido
      if (elapsedTime > 0) {
        const success = await saveTimeEntry()
        if (success) {
          saveTodayTime(elapsedTime)
          console.log(`Timer stopped for task ${taskId}, saved ${elapsedTime} seconds`)
        } else {
          console.error('Failed to save time entry')
        }
      }

      setElapsedTime(0)
      setDescription('')
    } catch (error) {
      console.error('Error stopping timer:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const saveTimeEntry = async (): Promise<boolean> => {
    try {
      console.log(`Saving time entry for task ${taskId}: ${elapsedTime} seconds`)
      
      const response = await fetch(`/api/tasks/${taskId}/time-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description || 'Tiempo de trabajo',
          duration: elapsedTime, // en segundos
          startTime: new Date(Date.now() - elapsedTime * 1000).toISOString(),
          endTime: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Time entry saved successfully:', result)
        return true
      } else {
        const errorData = await response.json()
        console.error('Error saving time entry:', response.status, errorData)
        return false
      }
    } catch (error) {
      console.error('Error saving time entry:', error)
      return false
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mt-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Cronómetro
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Hoy: {formatTime(todayTime)}
        </span>
      </div>

      <div className="flex items-center space-x-2 mb-2">
        <div className={`text-lg font-mono font-bold ${isRunning ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
          {formatTime(elapsedTime)}
        </div>
        
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>{isSaving ? 'Guardando...' : 'Iniciar'}</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            disabled={isSaving}
            className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            <span>{isSaving ? 'Guardando...' : 'Detener'}</span>
          </button>
        )}
      </div>

      {isRunning && (
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿En qué estás trabajando?"
          className="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      )}

      {isSaving && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Guardando tiempo...
        </div>
      )}
    </div>
  )
} 