import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Esperar a que la sesión esté lista
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        setSessionReady(true);
      } else {
        setError("Enlace inválido o expirado.");
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccess("Contraseña actualizada correctamente. Redirigiendo...");
      setError(null);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err.message);
      setError("Error al actualizar la contraseña.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleReset} className="bg-white p-8 rounded shadow max-w-md w-full">
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">Restablecer Contraseña</h2>

        {!sessionReady && !error && (
          <p className="text-center text-gray-600">Verificando el enlace...</p>
        )}

        {success && <p className="text-green-600 mb-4">{success}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {sessionReady && (
          <>
            <label className="block mb-2 font-medium text-secondary">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="••••••••"
              required
            />
            <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark">
              Actualizar
            </button>
          </>
        )}
      </form>
    </div>
  );
}
