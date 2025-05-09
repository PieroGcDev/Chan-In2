import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../services/authService";
import { useUser } from "../contexts/UserContext";
import { Eye, EyeOff } from "lucide-react";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { login, user } = useUser();
  const navigate = useNavigate();

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION_MINUTES = 5;

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

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
          setError(`Demasiados intentos. Intenta en ${minutes}:${seconds.toString().padStart(2, '0')} minutos.`);
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
    if (isBlocked) return setError("Aún estás bloqueado. Intenta más tarde.");

    try {
      const userData = await signIn(email, password);
      login(userData);
      localStorage.removeItem("loginAttempts");
      localStorage.removeItem("lastAttemptTime");
      navigate("/dashboard");
    } catch (err) {
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

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          Bienvenido
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}

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
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 rounded border border-gray-200 focus:border-primary focus:outline-none pr-10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isBlocked}
          className={`w-full font-semibold py-2 rounded transition ${
            isBlocked
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          Ingresar
        </button>

        <div className="text-center mt-4">
          <a href="/reset-password" className="text-sm text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;