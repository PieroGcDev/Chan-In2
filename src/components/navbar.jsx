import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useUser } from "../contexts/UserContext";

function Navbar() {
  const { user, logout } = useUser();
  const [isLoading, setIsLoading] = useState(true);  // Estado de carga
  const navigate = useNavigate();

  useEffect(() => {
    if (user !== null) {
      setIsLoading(false); // Desactivar el estado de carga una vez que el usuario esté disponible
    }
  }, [user]); // Este efecto se ejecutará cada vez que el valor de 'user' cambie.

  if (isLoading) {
    return <div>Loading...</div>; // Asegúrate de que no se muestre el navbar mientras el usuario se está cargando
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate("/login");
  };

  const { role } = user;

  return (
    <nav className="bg-primary text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">CHAN Tiendas</div>
        <ul className="flex space-x-4">
          <li>
            <Link to="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </li>
          {role === "admin" && (
            <>
              <li>
                <Link to="/products" className="hover:underline">
                  Productos
                </Link>
              </li>
              <li>
                <Link to="/machines" className="hover:underline">
                  Máquinas
                </Link>
              </li>
              <li>
                <Link to="/users" className="hover:underline">
                  Usuarios
                </Link>
              </li>
            </>
          )}
          {(role === "admin" || role === "colaborator") && (
            <li>
              <Link to="/reports" className="hover:underline">
                Reportes
              </Link>
            </li>
          )}
          <li>
            <button onClick={handleLogout} className="hover:underline">
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
