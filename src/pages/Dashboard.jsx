import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";
import AdminPanel from "../components/admin/AdminPanel";
import CollaboratorPanel from "../components/collaborator/collaboratorPanel";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const data = await fetchProfile(user.id);
      console.log(data); // Verifica la estructura de los datos
      setProfile(data);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!profile) return <p className="p-4">No se encontró el perfil.</p>;

  const role = profile.fk_roles?.name;

  return (
    <div className="flex flex-col min-h-screen">
      {/* YA NO Navbar aquí */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-primary text-white p-6">
          <h3 className="text-xl font-bold mb-4">CHAN Tiendas</h3>
          <p className="mb-2">Hola, Bienvenido a su panel de control {profile.nombre}</p>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-bg-light p-6">
          <h1 className="text-2xl font-semibold text-secondary mb-4">
            Dashboard
          </h1>
          <p className="mb-6">
            Rol:{" "}
            <span className="font-medium">
              {profile.fk_roles?.name || "Desconocido"}
            </span>
          </p>
          <div className="bg-white p-6 rounded-lg shadow">
            {role === "admin" ? <AdminPanel /> : <CollaboratorPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
