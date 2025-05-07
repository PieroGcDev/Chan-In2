import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../services/authService";
import { useUser } from "../contexts/UserContext";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const { login } = useUser();

  const MAX_ATTEMPTS = 5;

  // Cargar intentos desde localStorage
  useEffect(() => {
    const savedAttempts = localStorage.getItem("loginAttempts");
    if (savedAttempts) {
      setAttempts(parseInt(savedAttempts));
    }
  }, []);

  // Guardar en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem("loginAttempts", attempts);
  }, [attempts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (attempts >= MAX_ATTEMPTS) {
      setError("Has excedido el límite de intentos. Intenta más tarde.");
      return;
    }

    try {
      const userData = await signIn(email, password);
      login(userData);
      console.log("Inicio de sesión exitoso, redirigiendo...");
      localStorage.removeItem("loginAttempts"); // ← Reinicia si fue exitoso
      navigate("/dashboard");
    } catch (err) {
      console.error("Error al iniciar sesión:", err.message);
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setError("Has excedido el límite de intentos. Intenta más tarde.");
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

        <label className="block mb-1 font-medium text-secondary">
          Contraseña
        </label>
        <input
          type="password"
          className="w-full mb-6 p-2 rounded border border-gray-200 focus:border-primary focus:outline-none"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={attempts >= MAX_ATTEMPTS}
          className={`w-full font-semibold py-2 rounded transition ${
            attempts >= MAX_ATTEMPTS
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default Login;
