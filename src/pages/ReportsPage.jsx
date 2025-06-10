// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import {
  generateReport,
  fetchReportYears,
  fetchMachinesList,
  fetchMachineReport,
  fetchUsersList,
  insertUserReport,
  fetchUserReports,
  fetchAllUserReports,
  insertEmployeeReport,
  fetchEmployeeReports,
  insertAnnualValueReport,
  fetchAnnualValueReports,
} from "../services/reportService";

export default function ReportsPage() {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirección según rol
  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
    else if (user.role !== "admin" && user.role !== "colaborador")
      navigate("/dashboard", { replace: true });
  }, [user, navigate]);

    // **NEW: ramifica según rol**

  // Estados
  const [reportType, setReportType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [year, setYear] = useState("");
  const [years, setYears] = useState([]);
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [description, setDescription] = useState("");
  const [reportDate, setReportDate] = useState(() =>
  new Date().toISOString().slice(0, 10)
);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingMachines, setLoadingMachines] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState("");
  const [showHistoryMenu, setShowHistoryMenu] = useState(false);
  const [historyType, setHistoryType] = useState("");
  const [allReports, setAllReports] = useState([]);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [annualHistory, setAnnualHistory] = useState([]);
  const [summaryDescription, setSummaryDescription] = useState("");
  const [employeeReports, setEmployeeReports] = useState([]);
  const [annualReports, setAnnualReports] = useState([]);

  useEffect(() => {
    setDescription("");
    setReportData(null);
    // (opcional) también limpias otros campos según necesites:
    // setSelectedMachine("");
    // setSelectedUser("");
    // setDateFrom("");
    // setDateTo("");
    // setYear("");
  }, [reportType]);


  // Carga años para annualValue
  useEffect(() => {
    if (reportType === "annualValue") {
      setLoadingYears(true);
      setYears([]);
      setYear("");
      fetchReportYears()
        .then((list) => {
          setYears(list);
          if (list.length) setYear(list[0].toString());
        })
        .catch(() => setError("No se pudieron cargar los años."))
        .finally(() => setLoadingYears(false));
    }
  }, [reportType]);

  // Carga máquinas para machines
  useEffect(() => {
    if (reportType === "machines") {
      setLoadingMachines(true);
      setMachines([]);
      setSelectedMachine("");
      fetchMachinesList()
        .then((data) => setMachines(data))
        .catch(() => setError("No se pudieron cargar las máquinas."))
        .finally(() => setLoadingMachines(false));
    }
  }, [reportType]);

  const [myReports, setMyReports] = useState([]);

  useEffect(() => {
    if (user?.role === "colaborador") {
      fetchUserReports(user.id)
        .then(setMyReports)
        .catch(() => {/* opcional: setError */});
    }
  }, [user]);

  useEffect(() => {
  if (reportType === "employees") {
    fetchUsersList()           // Necesitas exportar esta función en reportService
      .then(list => setUsers(list))
      .catch(() => setError("No se pudieron cargar los empleados."));
  }
}, [reportType]);

// justo después de tus useState y antes de handleGenerate
useEffect(() => {
  if (user?.role === "colaborador") {
    setLoadingMachines(true);
    fetchMachinesList()
      .then(list => setMachines(list))
      .catch(() => setError("No se pudieron cargar las máquinas."))
      .finally(() => setLoadingMachines(false));
  }
}, [user, fetchMachinesList]);

useEffect(() => {
  // Si el Admin pidió “Historial de máquinas”
  if (historyType === "machines" && user?.role === "admin") {
    fetchAllUserReports()
      .then((list) => setAllReports(list))
      .catch((err) => console.error("Error cargando reportes de máquinas:", err));
  }

  // Si el Admin pidió “Historial de empleados”
  if (historyType === "employees" && user?.role === "admin") {
    // Llama a la nueva función que lee la tabla employee_reports
    fetchEmployeeReports()
      .then((list) => setEmployeeReports(list))
      .catch((err) => console.error("Error cargando employee_reports:", err));
  }

  // Si el Admin pidió “Historial valor anual”
  if (historyType === "annualValue" && user?.role === "admin") {
    // Llama a la nueva función que lee la tabla annual_value_reports
    fetchAnnualValueReports()
      .then((list) => setAnnualReports(list))
      .catch((err) => console.error("Error cargando annual_value_reports:", err));
  }
}, [historyType, user]);


useEffect(() => {
  if (reportType === "employees") {
    setDateFrom("");
    setDateTo("");
    setDescription("");
    // (Opcional) también podrías resetear summaryDescription aquí si quieres
    // setSummaryDescription("");
  }
}, [selectedUser, reportType]);

useEffect(() => {
  if (reportType === "employees") {
    // Limpiamos fechas y textarea
    setDateFrom("");
    setDateTo("");
    setDescription("");

    // + Limpiamos el resumen y cualquier reporte anterior
    setSummaryDescription("");
    setReportData(null);
  }
}, [selectedUser, reportType]);

useEffect(() => {
  if (reportType === "machines") {
    // Limpiar descripción y reporte anterior al cambiar de máquina
    setSummaryDescription("");
    setReportData(null);
    // (Opcional) si el campo “Fecha del reporte” debes resetearlo, podrías hacer:
    // setReportDate(new Date().toISOString().slice(0, 10));
  }
}, [selectedMachine, reportType]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // --- Flujo para COLABORADOR ---
    if (user.role === "colaborador") {
      // Validaciones específicas para colaborador
      if (!selectedMachine) {
        setError("Por favor selecciona una máquina.");
        setLoading(false);
        return;
      }
      if (!reportDate) {
        setError("Por favor selecciona la fecha del reporte.");
        setLoading(false);
        return;
      }
      if (!description) {
        setError("Por favor escribe la descripción del problema.");
        setLoading(false);
        return;
      }

      try {
      // Guardamos descripción para el Resumen y vaciamos el textarea
      setSummaryDescription(description);
      setDescription("");
  
      // 1) Inserta el reporte en machine_reports
      await insertUserReport({
        machine_id: selectedMachine,
        user_id: user.id,
        report_date: reportDate,
        description: summaryDescription, // o description original, según prefieras
        });

        // 2) Recarga “Mis reportes” para mostrarlo de inmediato
        const myReps = await fetchUserReports(user.id);
        setMyReports(myReps);

        // 3) Limpia el formulario de colaborador
        setSelectedMachine("");
        setReportDate(new Date().toISOString().slice(0, 10));
        setDescription("");
      } catch (err) {
        console.error("Error insertando reporte:", err);
        setError(err.message || "No se pudo enviar el reporte.");
      } finally {
        setLoading(false);
      }

      // ¡IMPORTANTE! Salimos aquí para que no ejecute la parte de Admin
      return;
    }

    // --- Flujo para ADMIN ---
    // 1) Validaciones iniciales de Admin
    if (reportType === "machines" && !selectedMachine) {
      setError("Por favor selecciona una máquina.");
      setLoading(false);
      return;
    }
    if (reportType === "annualValue" && !year) {
      setError("Por favor elige un año.");
      setLoading(false);
      return;
    }
    if (reportType === "employees" && (!selectedUser || !dateFrom || !dateTo)) {
      setError("Por favor define todas las fechas y selecciona el empleado.");
      setLoading(false);
      return;
    }

    // 2) Insertar/Generar “Empleados”
    if (reportType === "employees") {
      try {
        // 2.1) Guardamos la descripción
        setSummaryDescription(description);
        setDescription("");

        // 2.2) Generamos el conteo (opcional, para mostrar en pantalla)
        const reportResults = await generateReport({
          reportType: "employees",
          dateFrom,
          dateTo,
        });

        // 2.3) Insertamos en la tabla employee_reports
        await insertEmployeeReport({
          user_id: selectedUser,
          dateFrom,
          dateTo,
          description: summaryDescription,
        });

        // 2.4) Mostramos en pantalla el resultado del conteo
        setReportData(reportResults);

        // 2.5) Recargamos el historial de empleados
        fetchEmployeeReports()
          .then((list) => setEmployeeReports(list))
          .catch((err) =>
            console.error("Error recargando employeeReports:", err)
          );
      } catch (err) {
        console.error("Error guardando/generando reporte de empleados:", err);
        setError("No se pudo guardar el reporte de empleados.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3) Insertar/Generar “Valor monetario anual”
    if (reportType === "annualValue") {
      try {
        // 3.1) Guardamos la descripción
        setSummaryDescription(description);
        setDescription("");

        // 3.2) Calculamos el total
        const { total } = await generateReport({
          reportType: "annualValue",
          year,
        });

        // 3.3) Insertamos en la tabla annual_value_reports
        await insertAnnualValueReport({
          year,
          totalValue: total,
          description: summaryDescription,
        });

        // 3.4) Mostramos en pantalla el total
        setReportData({ year, total });

        // 3.5) Recargamos el historial de valor anual
        fetchAnnualValueReports()
          .then((list) => setAnnualReports(list))
          .catch((err) =>
            console.error("Error recargando annualReports:", err)
          );
      } catch (err) {
        console.error("Error guardando/generando reporte valor anual:", err);
        setError("No se pudo guardar el reporte valor anual.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 4) Flujo original “Máquinas”
    try {
      // 4.1) Guardamos la descripción
      setSummaryDescription(description);
      setDescription("");

      // 4.2) Generamos el reporte de máquina
      const data = await fetchMachineReport(selectedMachine);
      setReportData(data);
    } catch (err) {
      console.error("Error generando reporte de máquinas:", err);
      setError(err.message || "Error generando el reporte de máquinas.");
    } finally {
      setLoading(false);
    }
  };

  // Función para exportar sólo el contenedor #report-content
  const exportPDF = () => {
    import("html2pdf.js").then((html2pdf) => {
      const element = document.getElementById("report-content");
      html2pdf.default()
        .from(element)
        .set({ margin: 0.5, filename: `reporte_${selectedMachine}.pdf` })
        .save();
    });
  };

    if (user?.role === "colaborador") {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="container mx-auto p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Reportes de Máquinas (Colaborador)
          </h2>
          <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow p-6 space-y-4">
            {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}

            {/* Selector de máquina */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Máquina</label>
              <select
                value={selectedMachine}
                onChange={e => setSelectedMachine(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                disabled={loadingMachines}
                required
              >
                <option value="" disabled>
                  {loadingMachines ? "Cargando máquinas..." : "Selecciona una máquina"}
                </option>
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Fecha del reporte */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Fecha del reporte</label>
              <input
                type="date"
                value={reportDate}
                onChange={e => setReportDate(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                required
              />
            </div>

            {/* Descripción del problema */}
            <div>
              <label className="block mb-1 font-medium text-gray-700">Descripción del problema</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring h-24"
                placeholder="Describe aquí el problema"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded transition disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar reporte"}
            </button>
          </form>

          {/* Tabla de mis reportes */}
          {myReports.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Mis reportes enviados</h3>
              {/* Contenedor responsive */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Máquina</th>
                      <th className="p-2 border">Fecha de reporte</th>
                      <th className="p-2 border">Descripción</th>
                      <th className="p-2 border">Enviado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myReports.map((r) => (
                      <tr key={r.id} className="border-t hover:bg-gray-50">
                        <td className="p-2 border">{r.machines.name}</td>
                        <td className="p-2 border">{r.report_date}</td>
                        <td className="p-2 border">{r.description}</td>
                        <td className="p-2 border">
                          {new Date(r.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Generar Reporte</h2>

        <form onSubmit={handleGenerate} className="bg-white rounded-lg shadow p-6 space-y-4">
          {error && <div className="text-red-600 bg-red-100 p-2 rounded">{error}</div>}

          {/* Tipo de reporte */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Tipo de reporte</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
            >
              <option value="" disabled>
                Seleccione un Tipo de Reporte
              </option>
              <option value="employees">Empleados</option>
              <option value="machines">Máquinas</option>
              <option value="annualValue">Valor monetario anual</option>
            </select>
          </div>

          {/* Controles por tipo */}

          {reportType === "machines" && (
            <div className="space-y-4">
              {/* Selector de máquina */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Máquina</label>
                <select
                  value={selectedMachine}
                  onChange={(e) => setSelectedMachine(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                  disabled={loadingMachines}
                  required
                >
                  <option value="" disabled>
                    {loadingMachines ? "Cargando máquinas..." : "Selecciona una máquina"}
                  </option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha del reporte */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Fecha del reporte</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Descripción del problema</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring h-24"
                  placeholder="Describe aquí el problema"
                />
              </div>
            </div>
          )}

          {reportType === "annualValue" && (
            <div>
              <label className="block mb-1 font-medium text-gray-700">Año</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                disabled={loadingYears}
                required
              >
                <option value="" disabled>
                  {loadingYears ? "Cargando años..." : years.length ? "Selecciona un año" : "No hay años"}
                </option>
                {years.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === "employees" && (
            <div className="space-y-4">
              {/* Selección de empleado */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Empleado</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                  required
                >
                  <option value="" disabled>
                    Selecciona un empleado
                  </option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha desde / Fecha hasta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Fecha desde</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Fecha hasta</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring"
                    required
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block mb-1 font-medium text-gray-700">Descripción del problema</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring h-24"
                  placeholder="Describe aquí el problema"
                  required
                />
              </div>
            </div>
          )}


          {/* Botón Generar */}
          <button
            type="submit"
            disabled={loading}
            className={`bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Generando..." : "Generar Reporte"}
          </button>

          {/* Botón Historial de Reportes */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHistoryMenu((prev) => !prev)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
            >
              Historial de Reportes
            </button>

            {/* Menú desplegable, solo si showHistoryMenu = true */}
            {showHistoryMenu && (
              <ul className="absolute right-0 mt-2 w-56 bg-white border rounded shadow-lg z-10">
                <li>
                  <button
                    onClick={() => {
                      setHistoryType("machines");
                      setShowHistoryMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Historial de máquinas
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setHistoryType("employees");
                      setShowHistoryMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Historial de empleados
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setHistoryType("annualValue");
                      setShowHistoryMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Historial valor anual
                  </button>
                </li>
              </ul>
            )}
          </div>
        </form>

        {/* Mostrar resultados */}
        {reportData && (
          <div id="report-content" className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Resumen del Reporte</h3>

            {reportType === "machines" && (
              <>
                <p>
                  <strong>Máquina:</strong>{" "}
                  {machines.find((m) => m.id === selectedMachine)?.name || "—"}
                </p>
                <p>
                  <strong>Fecha del reporte:</strong> {reportDate}
                </p>
                <p>
                  <strong>Descripción:</strong> {summaryDescription}
                </p>

                {/* Movimientos (solo para reporte de máquinas) */}
                <h4 className="mt-4 font-medium">Movimientos:</h4>
                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto whitespace-pre-wrap">
                  {reportData}
                </pre>

                <button
                  onClick={exportPDF}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
                >
                  Exportar reporte
                </button>
              </>
            )}

            {reportType === "employees" && (
              <>
                <p>
                  <strong>Empleado:</strong>{" "}
                  {users.find((u) => u.id === selectedUser)?.name || "—"}
                </p>
                <p>
                  <strong>Fecha desde:</strong> {dateFrom}{" "}
                  <strong>Fecha hasta:</strong> {dateTo}
                </p>
                <p>
                  <strong>Descripción:</strong> {summaryDescription}
                </p>
              </>
            )}

            {reportType === "annualValue" && (
              <>
                <p>
                  <strong>Año:</strong> {year}
                </p>
                <p>
                  <strong>Descripción:</strong> {summaryDescription}
                </p>
              </>
            )}
          </div>
        )}


        {/* === HISTORIAL DE MÁQUINAS (Admin) === */}
        {historyType === "machines" && allReports.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Historial de máquinas (colaboradores)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Usuario</th>
                    <th className="p-2 border">Máquina</th>
                    <th className="p-2 border">Fecha de reporte</th>
                    <th className="p-2 border">Descripción</th>
                    <th className="p-2 border">Enviado</th>
                  </tr>
                </thead>
                <tbody>
                  {allReports.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      {/* Asumimos que fetchAllUserReports devolvió r.profiles.{nombre,apellido} */}
                      <td className="p-2 border">{`${r.profiles.nombre} ${r.profiles.apellido}`}</td>
                      <td className="p-2 border">{r.machines.name}</td>
                      <td className="p-2 border">{r.report_date}</td>
                      <td className="p-2 border">{r.description}</td>
                      <td className="p-2 border">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === HISTORIAL DE EMPLEADOS (Admin) === */}
        {historyType === "employees" && employeeReports.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Historial de empleados (todos los movimientos)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Empleado</th>
                    <th className="p-2 border">Fecha de inicio</th>
                    <th className="p-2 border">Fecha de fin</th>
                    <th className="p-2 border">Descripción</th>
                    <th className="p-2 border">Generado</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeReports.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-2 border">
                        {`${r.profiles.nombre} ${r.profiles.apellido}`}
                      </td>
                      <td className="p-2 border">{r.date_from}</td>
                      <td className="p-2 border">{r.date_to}</td>
                      <td className="p-2 border">{r.description}</td>
                      <td className="p-2 border">
                        {new Date(r.generated_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === HISTORIAL VALOR ANUAL (Admin) === */}
        {historyType === "annualValue" && annualReports.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Historial Valor Monetario Anual</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 border">Año</th>
                    <th className="p-2 border">Total Monetario</th>
                  </tr>
                </thead>
                <tbody>
                  {annualReports.map((entry) => (
                    <tr key={entry.year} className="border-t hover:bg-gray-50">
                      <td className="p-2 border">{entry.year}</td>
                      <td className="p-2 border">{entry.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
