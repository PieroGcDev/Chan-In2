import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchProfile } from "../services/profileService";
import { fetchMachines } from "../services/machineService";
import { fetchProducts } from "../services/productService";

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({
    products: 0,
    machines: 0,
    operativas: 0,
    noOperativas: 0,
  });
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    (async () => {
      setLoading(true);
      try {
        // Cargar perfil
        const perfil = await fetchProfile(user.id);
        setProfile(perfil);

        // Cargar productos y máquinas
        const productsData = await fetchProducts();
        const machinesData = await fetchMachines();
        const oper = machinesData.filter(m => m.status === "Operativa").length;
        const noOp = machinesData.length - oper;

        setCounts({
          products: productsData.length,
          machines: machinesData.length,
          operativas: oper,
          noOperativas: noOp,
        });

        // Últimos 5 productos
        const latestProds = productsData
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        setLatest(latestProds);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("Hubo un problema al cargar los datos.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  const role = profile?.fk_roles?.name ?? "Desconocido";

  return (
    <div className="min-h-screen bg-gray-50">
      <section
        className="w-full h-96 md:h-[22rem] relative"
        style={{
          backgroundImage: "url('/franja.png')",
          backgroundSize: "100% auto",       // Ajusta el zoom aquí (ej: 100%, 150%, 200%)
          backgroundPosition: "center 52%",   // Ajusta el corte vertical aquí (ej: "center 0%", "center 10%")
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center text-white px-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            Bienvenido a tu panel: <span className="capitalize">{role}</span>
          </h1>
        </div>
      </section>

      <main className="container mx-auto mt-6 p-4 space-y-6">
        {/* Mostrar error si lo hay */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">
            {error}
          </div>
        )}

        {/* Durante carga, sólo este mensaje */}
        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <h2 className="text-lg font-medium text-gray-700">No operativas</h2>
                <p className="text-4xl font-bold text-red-500">
                  {counts.noOperativas}
                </p>
              </div>
            </div>

            {/* Listado de últimos productos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Últimos productos
              </h3>
              {latest.length === 0 ? (
                <p className="text-gray-600">No hay productos registrados.</p>
              ) : (
                <ul className="divide-y">
                  {latest.map((p) => (
                    <li
                      key={p.id}
                      className="py-2 flex justify-between text-gray-700"
                    >
                      <span>{p.name}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
