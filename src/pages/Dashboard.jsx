import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";
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
      setProfile(data);
      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!profile) return <p className="p-4">No se encontró el perfil.</p>;

  const role = profile.fk_roles?.name ?? "Desconocido";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar fijo a la izquierda */}
      <aside className="w-64 bg-primary text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-4">CHAN Tiendas</h1>
          <p className="text-lg">Bienvenido a su panel:</p>
          <p className="font-bold mt-2 capitalize">{role}</p>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 p-8">
        <div className="bg-white p-8 rounded shadow-lg animate-fade-in">
          <h2 className="text-3xl font-bold text-primary mb-4">Panel de Control</h2>
          <p className="text-gray-700">
            Aquí puedes acceder a todas tus funciones disponibles según tu rol.
            Explora el menú lateral para navegar por tus herramientas.
          </p>
          {/* Aquí puedes colocar en el futuro gráficos, cards, etc */}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
