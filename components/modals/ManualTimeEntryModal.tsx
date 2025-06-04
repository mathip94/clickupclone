"use client";

import { useState } from "react";
import { X, Clock } from "lucide-react";

interface ManualTimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: string;
}

export default function ManualTimeEntryModal({
  isOpen,
  onClose,
  onSuccess,
  taskId,
}: ManualTimeEntryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hours: "",
    minutes: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalMinutes = parseInt(formData.hours || "0") * 60 + parseInt(formData.minutes || "0");
      
      if (totalMinutes <= 0) {
        alert("Por favor ingresa un tiempo válido");
        return;
      }

      const response = await fetch(`/api/tasks/${taskId}/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duration: totalMinutes,
          description: formData.description,
          date: formData.date,
        }),
      });

      if (response.ok) {
        onSuccess();
        setFormData({
          hours: "",
          minutes: "",
          description: "",
          date: new Date().toISOString().split("T")[0],
        });
      } else {
        const error = await response.json();
        alert(error.error || "Error al registrar tiempo");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al registrar tiempo");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Registrar Tiempo Manual
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="hours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horas
              </label>
              <input
                type="number"
                id="hours"
                min="0"
                max="23"
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="minutes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Minutos
              </label>
              <input
                type="number"
                id="minutes"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <input
              type="date"
              id="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Describe en qué trabajaste..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Registrando..." : "Registrar Tiempo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 