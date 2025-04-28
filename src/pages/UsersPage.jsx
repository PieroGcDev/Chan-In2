import React, { useEffect, useState } from "react";
import {
  fetchUsers,
  inviteUser,
  createCollaborator,
} from "../services/userservices";
import Modal from "react-modal"; // Importa React Modal

// Configura el estilo del modal
Modal.setAppElement("#root"); // Asegúrate de que tu app esté envuelta en un div con id="root"

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1) Crear cuenta Auth
      const user = await inviteUser({
        email: form.email,
        password: form.password,
      });
      // 2) Crear perfil como colaborador
      await createCollaborator({
        userId: user.id,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
      });
      // 3) Refrescar listado...
      fetchUsers().then(setUsers).catch(console.error);
      setShowForm(false); // Cerrar el modal
    } catch (err) {
      console.error("Error creando colaborador:", err);
    }
  };

  useEffect(() => {
    fetchUsers().then(setUsers).catch(console.error);
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-600">
          Gestión de Usuarios
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
        >
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-orange-600 text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3">
                  {u.nombre} {u.apellido}
                </td>
                <td className="p-3">{u.email ?? "—"}</td>
                <td className="p-3">{u.telefono}</td>
                <td className="p-3">{u.role?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para el Formulario */}
      <Modal
        isOpen={showForm}
        onRequestClose={() => setShowForm(false)}
        contentLabel="Crear Nuevo Usuario"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
          <h3 className="text-xl font-bold mb-4 text-orange-600">
            Crear Colaborador
          </h3>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
          />
          <input
            placeholder="Nombre"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
          />
          <input
            placeholder="Apellido"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) =>
              setForm((f) => ({ ...f, apellido: e.target.value }))
            }
          />
          <input
            placeholder="Teléfono"
            className="w-full p-2 mb-2 border rounded"
            onChange={(e) =>
              setForm((f) => ({ ...f, telefono: e.target.value }))
            }
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="mr-2 bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
            >
              Crear Colaborador
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
