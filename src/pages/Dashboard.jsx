import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";
import { fetchMachines } from "../services/machineService";
import { fetchProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    products: 0,
    machines: 0,
    operativas: 0,
    noOperativas: 0,
  });
  const [latest, setLatest] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      const perfil = await fetchProfile(user.id);
      setProfile(perfil);

      const productsData = await fetchProducts();
      const machinesData = await fetchMachines();
      const oper = machinesData.filter((m) => m.status === "Operativa").length;
      const noOp = machinesData.length - oper;

      const latestProds = productsData
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )
        .slice(0, 5);

      setCounts({
        products: productsData.length,
        machines: machinesData.length,
        operativas: oper,
        noOperativas: noOp,
      });
      setLatest(latestProds);

      setLoading(false);
    })();
  }, [navigate]);

  if (loading) return <p className="p-4">Cargando datos...</p>;
  const role = profile.fk_roles?.name ?? "Desconocido";

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto mt-6 p-4">
        {/* Hero */}
        <div className="bg-white rounded-lg shadow-lg p-6 animate-fade-in mb-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center">
            <h1 className="text-3xl font-bold text-primary">
              Panel de Control
            </h1>
            <p className="text-gray-600 mt-2 md:mt-0">
              Bienvenido,{" "}
              <span className="font-semibold capitalize">{role}</span>
            </p>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-700">Productos</h2>
            <p className="text-4xl font-bold text-primary">
              {counts.products}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-700">Máquinas</h2>
            <p className="text-4xl font-bold text-primary">
              {counts.machines}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-700">Operativas</h2>
            <p className="text-4xl font-bold text-green-500">
              {counts.operativas}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-medium text-gray-700">
              No operativas
            </h2>
            <p className="text-4xl font-bold text-red-500">
              {counts.noOperativas}
            </p>
          </div>
        </div>

        {/* Últimos productos */}
        <div className="bg-white rounded-lg shadow p-6 animate-fade-in">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">
            Últimos productos
          </h3>
          {latest.length === 0 ? (
            <p className="text-gray-600">No hay productos registrados.</p>
          ) : (
            <ul className="divide-y">
              {latest.map((p) => (
                <li key={p.id} className="py-2 flex justify-between">
                  <span>{p.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
