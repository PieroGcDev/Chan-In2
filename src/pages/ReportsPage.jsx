// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
// Aquí crearás este servicio para llamar a tu backend/Supabase
import { generateReport } from "../services/reportService";

export default function ReportsPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Si no es admin, le redirigimos
  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    } else if (user.role !== "admin") {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Estado del formulario
  const [reportType, setReportType] = useState("machines");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    if (!dateFrom || !dateTo) {
      setError("Por favor define ambas fechas.");
      return;
    }
    setLoading(true);
    try {
      // Llama a tu servicio (debes implementarlo)
      const data = await generateReport({ reportType, dateFrom, dateTo });
      setReportData(data);
    } catch (err) {
      console.error(err);
      setError("Error generando el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* El Navbar ya lo monta AppRoutes */}
      <main className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Generar Reporte
        </h2>

        {/* Formulario */}
        <form
          onSubmit={handleGenerate}
          className="bg-white rounded-lg shadow p-6 space-y-4"
        >
          {error && (
            <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>
          )}

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Tipo de reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
            >
              <option value="employees">Empleados</option>
              <option value="machines">Máquinas</option>
              <option value="annualValue">Valor monetario anual</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Fecha desde
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Fecha hasta
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>
        </form>

        {/* Mostrar resultados */}
        {reportData && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Resultados</h3>
            {/* Aquí puedes renderizar un gráfico, tabla o estadísticas */}
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(reportData, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
