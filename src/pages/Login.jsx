import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, resetPassword } from "../services/authService";
import { useUser } from "../contexts/UserContext";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION_MINUTES = 5;

  useEffect(() => {
    const checkBlockStatus = () => {
      const savedAttempts = parseInt(localStorage.getItem("loginAttempts")) || 0;
      const lastAttemptTime = localStorage.getItem("lastAttemptTime");

      if (savedAttempts >= MAX_ATTEMPTS && lastAttemptTime) {
        const now = new Date();
        const last = new Date(lastAttemptTime);
        const diffMs = now - last;
        const minutesPassed = diffMs / (1000 * 60);

        if (minutesPassed < BLOCK_DURATION_MINUTES) {
          const remainingMs = BLOCK_DURATION_MINUTES * 60 * 1000 - diffMs;
          const minutes = Math.floor(remainingMs / 60000);
          const seconds = Math.floor((remainingMs % 60000) / 1000);
          setIsBlocked(true);
          setError(`Demasiados intentos. Intenta en ${minutes}:${seconds.toString().padStart(2, "0")} minutos.`);
        } else {
          localStorage.removeItem("loginAttempts");
          localStorage.removeItem("lastAttemptTime");
          setAttempts(0);
          setIsBlocked(false);
          setError(null);
        }
      } else {
        setAttempts(savedAttempts);
      }
    };

    checkBlockStatus();
    const interval = setInterval(checkBlockStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBlocked) {
      setError("Aún estás bloqueado. Intenta más tarde.");
      return;
    }

    try {
      const userData = await signIn(email, password);
      login(userData);
      setSuccess("Inicio de sesión exitoso ✨");
      setError(null);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lastAttemptTime");

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      console.error("Error al iniciar sesión:", err.message);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("loginAttempts", newAttempts);
      localStorage.setItem("lastAttemptTime", new Date().toISOString());

      if (newAttempts >= MAX_ATTEMPTS) {
        setIsBlocked(true);
        setError("Has excedido el límite de intentos. Intenta nuevamente en 5 minutos.");
      } else {
        setError("Credenciales inválidas");
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Ingresa tu correo arriba para recuperar la contraseña.");
      return;
    }

    try {
      await resetPassword(email);
      setSuccess("Se envió un enlace de recuperación a tu correo.");
      setError(null);
    } catch (err) {
      console.error("Error al enviar enlace:", err.message);
      setError("No se pudo enviar el enlace. Verifica tu correo.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary text-center mb-4">Bienvenido</h2>

        {success && (
          <p className="text-green-600 text-center mb-4 animate-pulse">{success}</p>
        )}
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}

        <label className="block mb-1 font-medium text-secondary">Email</label>
        <input
          type="email"
          className="w-full mb-4 p-2 rounded border border-gray-200 focus:border-primary focus:outline-none"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="block mb-1 font-medium text-secondary">Contraseña</label>
        <input
          type="password"
          className="w-full mb-2 p-2 rounded border border-gray-200 focus:border-primary focus:outline-none"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={isBlocked}
          className={`w-full font-semibold py-2 rounded transition mb-2 ${
            isBlocked
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          Ingresar
        </button>

        <button
          type="button"
          onClick={handlePasswordReset}
          className="text-sm text-primary hover:underline w-full text-center mt-2"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}

export default Login;
