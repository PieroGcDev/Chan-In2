// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext"; // Cambiado para que coincida con el resto

const ProtectedRoute = ({ role, children }) => {
  const { user } = useUser();

  if (user === undefined) {
    return <div className="flex items-center justify-center h-full">Cargando…</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Rol del usuario desde Supabase
  const userRole = user?.role || user?.fk_roles?.name;

  // Si hay un rol requerido y el usuario no lo tiene
  if (role) {
    const rolesArray = Array.isArray(role) ? role : [role];
    if (!rolesArray.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500">
            Acceso no autorizado. No tienes permiso para ver esta página.
          </h1>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
