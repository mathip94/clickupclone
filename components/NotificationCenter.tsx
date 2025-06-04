"use client";

import { useState, useEffect } from "react";
import { Bell, X, Calendar, UserPlus, Clock, Check } from "lucide-react";

interface Notification {
  id: string;
  type: "MEETING_REMINDER" | "PROJECT_INVITATION" | "TASK_ASSIGNMENT" | "MEETING_INVITATION";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Verificar nuevas notificaciones cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // En implementación real, esto vendría de una API de notificaciones
      // Por ahora retornamos array vacío ya que no hay notificaciones reales implementadas
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "MEETING_REMINDER":
        return Calendar;
      case "PROJECT_INVITATION":
        return UserPlus;
      case "TASK_ASSIGNMENT":
        return Clock;
      case "MEETING_INVITATION":
        return Calendar;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "MEETING_REMINDER":
        return "text-yellow-600";
      case "PROJECT_INVITATION":
        return "text-green-600";
      case "TASK_ASSIGNMENT":
        return "text-gray-600";
      case "MEETING_INVITATION":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        title="Notificaciones"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowNotifications(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Notificaciones
                </h3>
                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400"
                    >
                      Marcar todo como leído
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Cargando notificaciones...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay notificaciones
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Te notificaremos cuando recibas invitaciones a proyectos, se te asignen tareas o te inviten a reuniones.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const iconColor = getNotificationColor(notification.type);

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          !notification.read ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-700 ${iconColor}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                {!notification.read && (
                                  <button
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400"
                                    title="Marcar como leído"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => removeNotification(notification.id)}
                                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                  title="Eliminar notificación"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <button className="w-full text-center text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 font-medium">
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
} 