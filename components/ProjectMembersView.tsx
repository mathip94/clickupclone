"use client";

import { useState, useEffect } from "react";
import { UserPlus, Crown, Shield, User, Mail, MoreVertical, X } from "lucide-react";
import InviteUserModal from "./modals/InviteUserModal";

interface ProjectMember {
  id: string;
  role: string;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface ProjectMembersViewProps {
  projectId: string;
  projectName: string;
  userRole: "OWNER" | "ADMIN" | "MEMBER";
  onClose: () => void;
}

const roleIcons = {
  OWNER: Crown,
  ADMIN: Shield,
  MEMBER: User,
};

const roleLabels = {
  OWNER: "Propietario",
  ADMIN: "Administrador", 
  MEMBER: "Miembro",
};

const roleColors = {
  OWNER: "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900",
  ADMIN: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800",
  MEMBER: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700"
};

export default function ProjectMembersView({
  projectId,
  projectName,
  userRole,
  onClose,
}: ProjectMembersViewProps) {
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionMember, setActionMember] = useState<string | null>(null);

  const canManageMembers = userRole === "OWNER" || userRole === "ADMIN";

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      } else {
        setError("Error al cargar miembros del proyecto");
      }
    } catch (error) {
      setError("Error al cargar miembros del proyecto");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres remover este miembro del proyecto?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members?userId=${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setMembers(members.filter(member => member.user.id !== userId));
        setActionMember(null);
      } else {
        const data = await response.json();
        setError(data.error || "Error al remover miembro");
      }
    } catch (error) {
      setError("Error al remover miembro");
    }
  };

  const handleInviteSuccess = () => {
    setShowInviteModal(false);
    fetchMembers(); // Refrescar lista de miembros
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
            <span className="text-gray-900 dark:text-white">Cargando miembros...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Miembros del Proyecto</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{projectName}</p>
            </div>
            <div className="flex items-center space-x-2">
              {canManageMembers && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Invitar</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded dark:bg-red-900 dark:border-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-4">
              {members.map((member) => {
                const RoleIcon = roleIcons[member.role as keyof typeof roleIcons];
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white font-medium">
                        {member.user.avatar ? (
                          <img
                            src={member.user.avatar}
                            alt={member.user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(member.user.name)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              roleColors[member.role as keyof typeof roleColors]
                            }`}
                          >
                            <RoleIcon className="h-3 w-3 mr-1" />
                            {roleLabels[member.role as keyof typeof roleLabels]}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3" />
                            <span>{member.user.email}</span>
                          </div>
                          <span>Se unió el {formatDate(member.joinedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {canManageMembers && member.role !== "OWNER" && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActionMember(
                              actionMember === member.id ? null : member.id
                            )
                          }
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {actionMember === member.id && (
                          <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
                            <button
                              onClick={() => handleRemoveMember(member.user.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                              Remover del proyecto
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {members.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay miembros en este proyecto
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {canManageMembers
                      ? "Invita a usuarios para que se unan a tu proyecto."
                      : "Aún no hay otros miembros en este proyecto."}
                  </p>
                  {canManageMembers && (
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Invitar Usuario</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close action menu */}
      {actionMember && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setActionMember(null)}
        />
      )}

      {showInviteModal && (
        <InviteUserModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
          projectId={projectId}
          type="project"
        />
      )}
    </>
  );
} 