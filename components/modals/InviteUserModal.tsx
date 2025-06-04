"use client";

import { useState } from "react";
import { X, Mail, UserPlus } from "lucide-react";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  projectId?: string;
  workspaceId?: string;
  type: "project" | "workspace";
}

export default function InviteUserModal({
  isOpen,
  onClose,
  onSuccess,
  projectId,
  workspaceId,
  type,
}: InviteUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("MEMBER");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);

    try {
      const endpoint = type === "project" 
        ? `/api/projects/${projectId}/members`
        : `/api/workspaces/${workspaceId}/members`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          role,
        }),
      });

      if (response.ok) {
        onSuccess();
        setEmail("");
        setRole("MEMBER");
      } else {
        const error = await response.json();
        alert(error.error || "Error al enviar invitación");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al enviar invitación");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-6">
            <UserPlus className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Invitar Usuario
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
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email del usuario *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rol
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="MEMBER">Miembro</option>
              <option value="ADMIN">Administrador</option>
              {type === "workspace" && <option value="OWNER">Propietario</option>}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {role === "MEMBER" && "Puede ver y participar en el proyecto"}
              {role === "ADMIN" && "Puede gestionar miembros y configuración"}
              {role === "OWNER" && "Control total sobre el workspace"}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md p-3">
            <p className="text-sm text-gray-800 dark:text-gray-200">
              Se enviará una invitación por email al usuario. Si no tiene cuenta, podrá crear una al aceptar la invitación.
            </p>
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
              disabled={loading || !email.trim()}
              className="flex-1 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Enviando..." : "Enviar Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 