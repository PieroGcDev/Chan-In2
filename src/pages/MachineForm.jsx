import React, { useState, useEffect } from "react";
import { createMachine, updateMachine, fetchMachineById } from "../services/machineService";
import { fetchUsersList } from "../services/reportService";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Si necesitas usar axios para obtener las ciudades y distritos

export default function MachineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState({
    name: "",
    code: "",
    assigned_to: "",
    status: "",
    department: "",
    city: "",
    district: "",
    address: "",  // Campo de dirección
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(!!id);
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (id) {
      const loadMachine = async () => {
        try {
          const data = await fetchMachineById(id);
          setMachine(data);
        } catch (error) {
          console.error("Error al cargar máquina:", error);
        } finally {
          setLoading(false);
        }
      };
      loadMachine();
    }

    // Cargar usuarios para el select “Asignado a”
    fetchUsersList()
      .then((list) => {
        console.log("Usuarios cargados en MachineForm:", list);
        setUsers(list);
      })
      .catch((err) => {
        console.error("No se pudieron cargar los usuarios:", err);
      });

    // Cargar datos de ubicación (departamentos, ciudades, distritos)
    setDepartments(["Piura", "Lima", "Cusco"]);  // Agrega aquí los departamentos disponibles
    if (machine.department) {
      // Cargar las ciudades de acuerdo al departamento seleccionado
      if (machine.department === "Piura") {
        setCities(["Piura", "Chiclayo", "Trujillo"]);
      } else if (machine.department === "Lima") {
        setCities(["Lima", "Callao", "Cañete"]);
      } else {
        setCities([]);
      }
    }

    if (machine.city) {
      // Cargar los distritos de acuerdo a la ciudad seleccionada
      if (machine.city === "Piura") {
        setDistricts(["Sechura", "Paita"]);
      } else if (machine.city === "Lima") {
        setDistricts(["Miraflores", "San Isidro"]);
      } else {
        setDistricts([]);
      }
    }
  }, [id, machine.department, machine.city]);  // Recargar ciudades y distritos cuando cambian los valores

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMachine((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateMachine(id, machine);
      } else {
        await createMachine(machine);
      }
      navigate("/machines");
    } catch (error) {
      console.error("Error al guardar la máquina:", error);
    }
  };

  if (loading) return <p className="p-4">Cargando máquina...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {id ? "Editar Máquina" : "Nueva Máquina"}
      </h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" value={machine.name || ""} onChange={handleChange} required className="w-full p-2 mb-4 border rounded" />
        <input name="code" placeholder="Código" value={machine.code} onChange={handleChange} required className="w-full p-2 mb-4 border rounded" />

        {/* Asignado a */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Asignado a</label>
          <select
            name="assigned_to"
            value={machine.assigned_to}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring"
          >
            <option value="" disabled>
              {users.length ? "Selecciona un usuario" : "Cargando usuarios..."}
            </option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Estado */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Estado</label>
          <select
            name="status"
            value={machine.status}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring"
            required
          >
            <option value="" disabled>
              Selecciona estado
            </option>
            <option value="Operativa">Operativa</option>
            <option value="No operativa">No operativa</option>
          </select>
        </div>

        {/* Departamento */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Departamento</label>
          <select
            name="department"
            value={machine.department || ""}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecciona un Departamento</option>
            {departments.map((dep) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>

        {/* Ciudad */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Ciudad</label>
          <select
            name="city"
            value={machine.city}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecciona una Ciudad</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        {/* Distrito */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Distrito</label>
          <select
            name="district"
            value={machine.district}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecciona un Distrito</option>
            {districts.map((district) => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {/* Dirección */}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Dirección Específica</label>
          <input
            name="address"
            value={machine.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Ej. Avenida Sullana con Cusco"
            required
          />
        </div>

        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
