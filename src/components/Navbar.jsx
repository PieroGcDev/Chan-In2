import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../contexts/UserContext";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;
  const { role } = user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50 h-16">
      <div className="container mx-auto flex items-center justify-between h-full px-4">
        {/* Logo */}
        <div className="flex-1">
          <NavLink to="/">
            {/* altura del logo mayor, pero dentro del navbar de 4rem */}
            <img
              src="/chan.png"
              alt="CHAN Tiendas"
              className="h-16 object-contain"
            />
          </NavLink>
        </div>

        {/* Menú de escritorio */}
        <ul className="hidden md:flex flex-1 justify-center space-x-6">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "underline font-semibold" : "hover:underline"
              }
            >
              Dashboard
            </NavLink>
          </li>
          {role === "colaborador" && (
            <li>
              <NavLink
                to="/scanner"
                className={({ isActive }) =>
                  isActive ? "underline font-semibold" : "hover:underline"
                }
              >
                Escáner
              </NavLink>
            </li>
          )}
          {(role === "admin" || role === "colaborador") && (
            <>
              <li>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? "underline font-semibold" : "hover:underline"
                  }
                >
                  Productos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/machines"
                  className={({ isActive }) =>
                    isActive ? "underline font-semibold" : "hover:underline"
                  }
                >
                  Máquinas
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/reports"
                  className={({ isActive }) =>
                    isActive ? "underline font-semibold" : "hover:underline"
                  }
                >
                  Reportes
                </NavLink>
              </li>
            </>
          )}
          {role === "admin" && (
            <li>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  isActive ? "underline font-semibold" : "hover:underline"
                }
              >
                Usuarios
              </NavLink>
            </li>
          )}
        </ul>

        {/* Botón logout y hamburguesa móvil */}
        <div className="flex-1 flex justify-end items-center">
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
          <button
            className="md:hidden ml-4"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <ul className="md:hidden bg-primary px-4 pb-4 space-y-2">
          <li>
            <NavLink
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block hover:underline"
            >
              Dashboard
            </NavLink>
          </li>
          {role === "colaborador" && (
            <li>
              <NavLink
                to="/scanner"
                onClick={() => setMenuOpen(false)}
                className="block hover:underline"
              >
                Escáner
              </NavLink>
            </li>
          )}
          {(role === "admin" || role === "colaborador") && (
            <>
              <li>
                <NavLink
                  to="/products"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:underline"
                >
                  Productos
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/machines"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:underline"
                >
                  Máquinas
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/reports"
                  onClick={() => setMenuOpen(false)}
                  className="block hover:underline"
                >
                  Reportes
                </NavLink>
              </li>
            </>
          )}
          {role === "admin" && (
            <li>
              <NavLink
                to="/users"
                onClick={() => setMenuOpen(false)}
                className="block hover:underline"
              >
                Usuarios
              </NavLink>
            </li>
          )}
          <li>
            <button
              onClick={handleLogout}
              className="w-full text-left hover:underline"
            >
              Cerrar sesión
            </button>
          </li>
        </ul>
      )}
    </nav>
);
}
