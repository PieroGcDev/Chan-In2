import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../contexts/UserContext";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== null) setIsLoading(false);
  }, [user]);

  if (isLoading) return <div>Loading...</div>;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/login");
  };

  const { role } = user;

  return (
    <nav className="bg-primary text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">CHAN Tiendas</div>

        <button className="md:hidden" onClick={() => setMenuOpen((prev) => !prev)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <ul className="hidden md:flex space-x-4">
          <li>
            <Link to="/dashboard" className="hover:underline">Dashboard</Link>
          </li>

          {/* Permitir productos a admin y colaborador */}
          {(role === "admin" || role === "colaborador") && (
            <li><Link to="/products" className="hover:underline">Productos</Link></li>
          )}

          {role === "admin" && (
            <>
              <li><Link to="/machines" className="hover:underline">Máquinas</Link></li>
              <li><Link to="/users" className="hover:underline">Usuarios</Link></li>
            </>
          )}

          {/* Reportes disponible para ambos */}
          {(role === "admin" || role === "colaborador") && (
            <li><Link to="/reports" className="hover:underline">Reportes</Link></li>
          )}

          <li>
            <button onClick={handleLogout} className="hover:underline">Cerrar sesión</button>
          </li>
        </ul>
      </div>

      {menuOpen && (
        <ul className="md:hidden mt-4 space-y-2 px-4">
          <li><Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>

          {(role === "admin" || role === "colaborador") && (
            <li><Link to="/products" onClick={() => setMenuOpen(false)}>Productos</Link></li>
          )}

          {role === "admin" && (
            <>
              <li><Link to="/machines" onClick={() => setMenuOpen(false)}>Máquinas</Link></li>
              <li><Link to="/users" onClick={() => setMenuOpen(false)}>Usuarios</Link></li>
            </>
          )}

          {(role === "admin" || role === "colaborador") && (
            <li><Link to="/reports" onClick={() => setMenuOpen(false)}>Reportes</Link></li>
          )}

          <li><button onClick={handleLogout}>Cerrar sesión</button></li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;
