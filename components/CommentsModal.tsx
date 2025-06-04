"use client"

import React, { useState, useEffect } from 'react'

interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

interface CommentsModalProps {
  isOpen: boolean
  onClose: () => void
  taskId: string
  taskTitle: string
}

export default function CommentsModal({ isOpen, onClose, taskId, taskTitle }: CommentsModalProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && taskId) {
      fetchComments()
    }
  }, [isOpen, taskId])

  const fetchComments = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data)
      } else {
        setError('Error al cargar los comentarios')
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        }),
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [comment, ...prev])
        setNewComment('')
      } else {
        setError('Error al agregar el comentario')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      } else {
        setError('Error al eliminar el comentario')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      setError('Error de conexión')
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comentarios</h2>
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

        {/* Add Comment Form */}
        <form onSubmit={addComment} className="mb-6">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              {isSubmitting ? 'Enviando...' : 'Comentar'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando comentarios...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay comentarios aún</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Sé el primero en comentar sobre esta tarea.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.author.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {comment.author.name || comment.author.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(comment.createdAt)}
                        {comment.createdAt !== comment.updatedAt && ' (editado)'}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-400 hover:text-red-600 p-1"
                    title="Eliminar comentario"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div className="ml-11">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {comment.content}
                  </p>
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