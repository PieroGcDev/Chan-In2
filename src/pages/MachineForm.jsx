import React, { useState, useEffect } from "react";
import { createMachine, updateMachine, fetchMachineById } from "../services/machineService";
import { fetchUsersList } from "../services/reportService";
import { useNavigate, useParams } from "react-router-dom";

export default function MachineForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [machine, setMachine] = useState({
    name: "",
    code: "",
    assigned_to: "",
    status: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(!!id);

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
       // Carga usuarios para el select “Asignado a”
      fetchUsersList()
        .then((list) => {
          console.log("Usuarios cargados en MachineForm:", list);
          setUsers(list);
        })
        .catch((err) => {
          console.error("No se pudieron cargar los usuarios:", err);
        });
  }, [id]);

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
        <input name="name" placeholder="Nombre" value={machine.name} onChange={handleChange} required className="w-full p-2 mb-4 border rounded" />
        <input name="code" placeholder="Código" value={machine.code} onChange={handleChange} required className="w-full p-2 mb-4 border rounded" />
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
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
