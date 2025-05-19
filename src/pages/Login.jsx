import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signIn } from "../services/authService";  // ahora signIn maneja lock
import { useUser } from "../contexts/UserContext";
import { Eye, EyeOff } from "lucide-react";
import "../index.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userData = await signIn(email, password);
      login(userData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          disabled={loading}
        />

        <label className="block mb-1 font-medium text-secondary">
          Contraseña
        </label>
        <div className="relative mb-6">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full p-2 rounded border border-gray-200 focus:border-primary focus:outline-none pr-10"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full font-semibold py-2 rounded transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed text-white"
              : "bg-primary hover:bg-primary-dark text-white"
          }`}
        >
          {loading ? "Procesando..." : "Ingresar"}
        </button>

        <div className="text-center mt-4">
          <a
            href="/reset-password"
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
