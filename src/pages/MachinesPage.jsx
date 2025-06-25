import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchMachines, createMachine, deleteMachine, updateMachine } from "../services/machineService";
import { fetchUsersList } from "../services/reportService";
import Modal from "react-modal";
import { useUser } from "../contexts/UserContext";
import axios from "axios"; // Importar axios para hacer solicitudes HTTP

Modal.setAppElement("#root");

export default function MachinesPage() {
  const { user } = useUser();
  const role = user?.role;
  const [machines, setMachines] = useState([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    assigned_to: "",
    status: "",
    department: "",
    city: "",
    district: "",
    address: "", // Campo para dirección específica
  });
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const API_KEY = "tu_clave_de_api_aqui"; // Usa tu clave de API de Google Cloud

  // Cargar las máquinas existentes
  const loadMachines = async () => {
    try {
      const data = await fetchMachines();
      setMachines(data);
    } catch (error) {
      console.error("Error cargando máquinas:", error.message);
    }
  };

  // Cargar los usuarios
  useEffect(() => {
    loadMachines();
    fetchUsersList()
      .then(list => setUsers(list))
      .catch(() => console.error("No se pudieron cargar los usuarios."));
  }, []);

  // Cargar la ubicación de la API
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Obtener los departamentos desde la API
        setDepartments(["Piura", "Lima", "Cusco"]); // Este es solo un ejemplo estático

        // Obtener las ciudades por departamento
        if (form.department) {
          const citiesResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${form.department}&key=${API_KEY}`
          );
          setCities(["Piura", "Chiclayo", "Trujillo"]); // Ejemplo estático
        }

        // Obtener distritos por ciudad
        if (form.city) {
          const districtsResponse = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${form.city}&key=${API_KEY}`
          );
          setDistricts(["Sechura", "Paita"]); // Ejemplo estático
        }
      } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
      }
    };

    fetchLocationData();
  }, [form.department, form.city]);

  // Manejo del submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Verifica los valores de 'form' en consola antes de hacer la validación
    console.log("Form data before validation:", form);

    // Validar si todos los campos requeridos están completos
    if (!form.name || !form.code || !form.status || !form.department || !form.city || !form.district || !form.address) {
      setError("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      await createMachine(form);
      setShowForm(false);
      setForm({ name: "", code: "", assigned_to: "", status: "", department: "", city: "", district: "", address: "" });
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
              {role === "colaborador" && <th className="p-3 border">Asignar Productos</th>}
              <th className="p-3 border">Visualizar Stock</th>
              <th className="p-3 border">Ubicación</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {machines.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="p-3 border">{m.name}</td>
                <td className="p-3 border">{m.code}</td>
                <td className="p-3 border">{users.find((u) => u.id === m.assigned_to)?.name || "—"}</td>
                <td className="p-3 border">
                  {role === "admin" ? (
                    <select
                      value={m.status}
                      onChange={(e) => handleChangeStatus(m.id, e.target.value)}
                      className={`p-2 rounded text-white font-bold ${m.status === "Operativa" ? "bg-green-500" : "bg-red-500"}`}
                    >
                      <option value="Operativa" className="text-black">Operativa</option>
                      <option value="No operativa" className="text-black">No operativa</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded text-white font-bold ${m.status === "Operativa" ? "bg-green-500" : "bg-red-500"}`}>
                      {m.status}
                    </span>
                  )}
                </td>
                {role === "admin" && (
                  <td className="p-3 border space-x-2">
                    <button className="text-blue-500 hover:underline" onClick={() => navigate(`/machines/edit/${m.id}`)}>✏️</button>
                    <button className="text-red-500 hover:underline" onClick={() => handleDelete(m.id)}>🗑️</button>
                  </td>
                )}

                {role === "colaborador" && (
                  <td className="p-3 border">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => navigate(`/machines/${m.id}/assign-products`)}  // Nueva ruta para asignar productos
                    >
                      Asignar Productos
                    </button>
                  </td>
                )}

                <td className="p-3 border">
                  <button className="text-green-500 hover:underline" onClick={() => navigate(`/machines/${m.id}/products`)}>Ver Productos</button>
                </td>
                <td className="p-3 border">
                  {/* Concatenamos departamento, ciudad, distrito y dirección */}
                  {`${m.department || "—"}, ${m.city || "—"}, ${m.district || "—"} ${m.address || ""}`}
                </td>
                            
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de añadir máquina */}
      <Modal isOpen={showForm} onRequestClose={() => setShowForm(false)} contentLabel="Añadir Máquina" className="modal-content" overlayClassName="modal-overlay">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
          <h3 className="text-xl font-bold text-primary">Nueva Máquina</h3>
          {error && <p className="text-red-600">{error}</p>}
          <input type="text" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full p-2 border rounded" required />
          <input type="text" placeholder="Código" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full p-2 border rounded" required />

          {/* Campos de Ubicación */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Asignado a</label>
            <select
              value={form.assigned_to}
              onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona un usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Estado</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="" disabled>Selecciona estado</option>
              <option value="Operativa">Operativa</option>
              <option value="No operativa">No operativa</option>
            </select>
          </div>

          {/* Departamento, Ciudad, Distrito, Dirección */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Departamento</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value, city: "", district: "" })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona un Departamento</option>
              {departments.map((dep) => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Ciudad</label>
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value, district: "" })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona una Ciudad</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Distrito</label>
            <select
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona un Distrito</option>
              {districts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">Dirección Específica (Avenida, etc.)</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Ej. Avenida Sullana con Cusco"
              required
            />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="mr-2 bg-gray-300 py-2 px-4 rounded">Cancelar</button>
            <button type="submit" className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark">Crear Máquina</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
