import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchMachines, createMachine, deleteMachine, updateMachine } from "../services/machineService";
import Modal from "react-modal";
import { useUser } from "../contexts/UserContext";

Modal.setAppElement("#root");

export default function MachinesPage() {
  const { user } = useUser();
  const role = user?.role;
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({ name: "", code: "", assigned_to: "", status: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadMachines = async () => {
    try {
      const data = await fetchMachines();
      setMachines(data);
    } catch (error) {
      console.error("Error cargando máquinas:", error.message);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.code || !form.status) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      await createMachine(form);
      setShowForm(false);
      setForm({ name: "", code: "", assigned_to: "", status: "" });
      loadMachines();
    } catch (error) {
      console.error("Error creando máquina:", error.message);
      setError("Error creando máquina.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta máquina?")) return;

    try {
      await deleteMachine(id);
      loadMachines();
    } catch (error) {
      console.error("Error al eliminar máquina:", error.message);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      await updateMachine(id, { status: newStatus });
      loadMachines();
    } catch (error) {
      console.error("Error al actualizar estado:", error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white rounded shadow animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Gestión de Máquinas</h2>
        {role === "admin" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
          >
            Añadir Máquina
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow text-sm border">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="p-3 border">Nombre</th>
              <th className="p-3 border">Código</th>
              <th className="p-3 border">Asignado a</th>
              <th className="p-3 border">Estado</th>
              {role === "admin" && <th className="p-3 border">Acciones</th>}
            </tr>
          </thead>
          <tbody className="text-center">
            {machines.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="p-3 border">{m.name}</td>
                <td className="p-3 border">{m.code}</td>
                <td className="p-3 border">{m.assigned_to ?? "—"}</td>
                <td className="p-3 border">
                  {role === "admin" ? (
                    <select
                      value={m.status}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className={`p-2 rounded text-white font-bold ${
                        m.status === "Operativa" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <option value="Operativa" className="text-black">Operativa</option>
                      <option value="No operativa" className="text-black">No operativa</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-white font-bold ${
                      m.status === "Operativa" ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {m.status}
                    </span>
                  )}
                </td>
                {role === "admin" && (
                  <td className="p-3 border space-x-2">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/machines/edit/${m.id}`)}
                    >
                      ✏️
                    </button>
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(m.id)}
                    >
                      🗑️
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de añadir máquina */}
      <Modal
        isOpen={showForm}
        onRequestClose={() => setShowForm(false)}
        contentLabel="Añadir Máquina"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <h3 className="text-xl font-bold text-primary">Nueva Máquina</h3>
          {error && <p className="text-red-600">{error}</p>}
          <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full p-2 border rounded" required />
          <input type="text" placeholder="Código" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} className="w-full p-2 border rounded" required />
          <input type="text" placeholder="Asignado a" value={form.assigned_to} onChange={(e) => setForm((f) => ({ ...f, assigned_to: e.target.value }))} className="w-full p-2 border rounded" />
          <input type="text" placeholder="Estado" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full p-2 border rounded" required />
          <div className="flex justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="mr-2 bg-gray-300 py-2 px-4 rounded">Cancelar</button>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark">Crear Máquina</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
