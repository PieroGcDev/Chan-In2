import React, { useEffect, useState } from "react";
import { inviteUser, createProfileSafe, fetchUsers } from "../services/userservices";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    role_id: "2", // Colaborador por defecto
  });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await inviteUser({ email: form.email, password: form.password });
      await createProfileSafe({
        id: user.id,
        nombre: form.nombre,
        apellido: form.apellido,
        telefono: form.telefono,
        email: form.email,
        role_id: form.role_id,
      });
      await loadUsers();
      setShowForm(false);
      setForm({ email: "", password: "", nombre: "", apellido: "", telefono: "", role_id: "2" });
    } catch (err) {
      console.error("Error creando usuario:", err.message);
      setError("Error creando usuario: " + err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-600">Gestión de Usuarios</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
        >
          Nuevo Usuario
        </button>
      </div>

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
                <td className="p-3">{u.nombre} {u.apellido}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.telefono}</td>
                <td className="p-3">{u.role?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showForm}
        onRequestClose={() => setShowForm(false)}
        contentLabel="Crear Nuevo Usuario"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-2">
          <h3 className="text-xl font-bold mb-4 text-orange-600">Crear Usuario</h3>
          {error && <p className="text-red-600">{error}</p>}
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <input
            type="password"
            placeholder="Contraseña"
            required
            className="w-full p-2 border rounded"
            value={form.password}
            onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <input
            placeholder="Nombre"
            required
            className="w-full p-2 border rounded"
            value={form.nombre}
            onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
          />
          <input
            placeholder="Apellido"
            required
            className="w-full p-2 border rounded"
            value={form.apellido}
            onChange={(e) => setForm(f => ({ ...f, apellido: e.target.value }))}
          />
          <input
            placeholder="Teléfono"
            required
            className="w-full p-2 border rounded"
            value={form.telefono}
            onChange={(e) => setForm(f => ({ ...f, telefono: e.target.value }))}
          />

          <select
            className="w-full p-2 border rounded"
            value={form.role_id}
            onChange={(e) => setForm(f => ({ ...f, role_id: e.target.value }))}
          >
            <option value="1">Admin</option>
            <option value="2">Colaborador</option>
          </select>

          <div className="flex justify-end pt-4">
            <button type="button" onClick={() => setShowForm(false)} className="mr-2 bg-gray-300 py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
