// src/pages/UsersPage.jsx

import React, { useEffect, useState, useMemo } from "react";
import {
  inviteUser,
  createProfileSafe,
  fetchUsers,
  updateProfileSafe,
  deleteProfile,
} from "../services/userservices";
import Modal from "react-modal";
import { Edit2, Trash2 } from "lucide-react";

Modal.setAppElement("#root");

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    id: null,
    email: "",
    password: "",
    nombre: "",
    apellido: "",
    telefono: "",
    role_id: "2",
  });
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error cargando usuarios:", err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openNew = () => {
    setIsEditing(false);
    setForm({
      id: null,
      email: "",
      password: "",
      nombre: "",
      apellido: "",
      telefono: "",
      role_id: "2",
    });
    setError(null);
    setShowForm(true);
  };

  const openEdit = (u) => {
    setIsEditing(true);
    setForm({
      id: u.id,
      email: u.email,
      password: "",
      nombre: u.nombre,
      apellido: u.apellido,
      telefono: u.telefono,
      role_id: u.role_id?.toString() || "2",
    });
    setError(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
    try {
      await deleteProfile(id);
      await loadUsers();
    } catch (err) {
      console.error("Error al eliminar usuario:", err.message);
      setError("No se pudo eliminar el usuario.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEditing) {
        // Actualizar perfil existente
        await updateProfileSafe({
          id: form.id,
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          role_id: form.role_id,
          email: form.email,
        });
      } else {
        // Crear nueva cuenta y perfil
        const user = await inviteUser({
          email: form.email,
          password: form.password,
        });
        await createProfileSafe({
          id: user.id,
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono,
          role_id: form.role_id,
          email: form.email,
        });
      }
      await loadUsers();
      setShowForm(false);
    } catch (err) {
      console.error("Error guardando usuario:", err.message);
      setError("Error: " + err.message);
    }
  };

  // Filtrar por nombre, apellido o email (convertimos null/undefined a "")
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const nombre   = (u.nombre   ?? "").toLowerCase();
      const apellido = (u.apellido ?? "").toLowerCase();
      const email    = (u.email    ?? "").toLowerCase();
      return (
        nombre.includes(q) ||
        apellido.includes(q) ||
        email.includes(q)
      );
    });
  }, [users, search]);

{/* mt-6 para espacio entre navbar y contenedores */}

  return (
    <div className="container mx-auto px-4 space-y-4 mt-6"> 
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-orange-600">
          Gestión de Usuarios
        </h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 sm:flex-none w-full sm:w-64 p-2 border rounded focus:ring focus:border-orange-400"
          />
          <button
            onClick={openNew}
            className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition"
          >
            Nuevo Usuario
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="text-red-600 bg-red-100 p-2 rounded">
          {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="container mx-auto bg-white rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full table-auto min-w-full">
          <thead className="bg-orange-500">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-white-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white-600 uppercase tracking-wider">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white-600 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-white-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, idx) => (
              <tr
                key={u.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-orange-50 transition`}
              >
                <td className="px-4 py-3">
                  {u.nombre} {u.apellido}
                </td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.telefono}</td>
                <td className="px-4 py-3 capitalize">{u.role?.name}</td>
                <td className="px-4 py-3 flex space-x-2">
                  <button onClick={() => openEdit(u)}>
                    <Edit2 size={18} className="text-blue-500 hover:text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(u.id)}>
                    <Trash2 size={18} className="text-red-500 hover:text-red-600" />
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={showForm}
        onRequestClose={() => setShowForm(false)}
        contentLabel={isEditing ? "Editar Usuario" : "Crear Usuario"}
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-3"
        >
          <h3 className="text-xl font-bold text-orange-600 mb-2">
            {isEditing ? "Editar Usuario" : "Crear Usuario"}
          </h3>

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full p-2 border rounded"
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
          />

          {!isEditing && (
            <input
              type="password"
              placeholder="Contraseña"
              required
              className="w-full p-2 border rounded"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
            />
          )}

          <input
            placeholder="Nombre"
            required
            className="w-full p-2 border rounded"
            value={form.nombre}
            onChange={(e) =>
              setForm((f) => ({ ...f, nombre: e.target.value }))
            }
          />
          <input
            placeholder="Apellido"
            required
            className="w-full p-2 border rounded"
            value={form.apellido}
            onChange={(e) =>
              setForm((f) => ({ ...f, apellido: e.target.value }))
            }
          />
          <input
            placeholder="Teléfono"
            required
            className="w-full p-2 border rounded"
            value={form.telefono}
            onChange={(e) =>
              setForm((f) => ({ ...f, telefono: e.target.value }))
            }
          />

          <select
            className="w-full p-2 border rounded"
            value={form.role_id}
            onChange={(e) =>
              setForm((f) => ({ ...f, role_id: e.target.value }))
            }
          >
            <option value="1">Admin</option>
            <option value="2">Colaborador</option>
          </select>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button className="bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700">
              {isEditing ? "Actualizar" : "Crear Usuario"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
