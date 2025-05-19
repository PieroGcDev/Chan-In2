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
    <div className="login-bg px-4">
      <div className="glass-card pt-6 px-8 pb-8 animate-fade-in">
        {/* Logo encima de “Bienvenido”, con menos margen */}
        <div className="flex justify-center mb-1">
          <img
            src="/chan.png"
            alt="CHAN Tiendas"
            className="h-[5rem] md:h-[9rem] w-auto object-contain"
          />
        </div>

        {/* Título con margen inferior reducido */}
        <h2 className="text-2xl font-bold text-primary text-center mb-4">
          Bienvenido
        </h2>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 rounded border border-gray-300 focus:border-primary focus:outline-none"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full p-2 rounded border border-gray-300 focus:border-primary focus:outline-none pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-gray-500"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-primary hover:bg-primary-dark text-white"
            }`}
          >
            {loading ? "Procesando..." : "Ingresar"}
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href="/reset-password"
            className="text-sm text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
