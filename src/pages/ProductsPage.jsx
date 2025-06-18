import React, { useEffect, useState } from "react";
import { fetchProducts, deleteProduct, addProduct } from "../services/productService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchMachines } from "../services/machineService"; // Servicio para obtener las máquinas

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]); // Estado para las máquinas
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();
  const role = user?.role || "guest";

  // Cargar los productos
  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  // Cargar las máquinas
  const loadMachines = async () => {
    try {
      const data = await fetchMachines();
      setMachines(data);
    } catch (err) {
      console.error("Error al cargar máquinas:", err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadMachines(); // Llamar a la carga de máquinas cuando se monta el componente
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirm) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  // Manejar el formulario de añadir producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const newProduct = {
      name: form.get("name"),
      stock: form.get("stock"),
      machine_id: form.get("machine_id"),
    };

    try {
      await addProduct(newProduct); // Llamada a la función de añadir producto
      await loadProducts(); // Recargar productos
      navigate("/products"); // Redirigir a la página de productos
    } catch (err) {
      console.error("Error al añadir producto:", err);
    }
  };

  return (
    <div className="bg-bg-light min-h-screen p-6">
      <div className="container mx-auto bg-white p-6 rounded-lg shadow animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Gestión de Productos</h2>
          {role === "admin" && (
            <button
              onClick={() => navigate("/admin/products/new")}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
            >
              Añadir Producto
            </button>
          )}
        </div>

        <div className="flex mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 border border-gray-200 rounded-l"
          />
          <button className="bg-primary hover:bg-primary-dark text-white px-4 rounded-r">
            🔍
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded shadow text-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2">Imagen</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">Descripción</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Precio</th>
                <th className="p-2">Código de barras</th>
                <th className="p-2">Fecha de Expiración</th> {/* Nueva columna para la fecha de expiración */}
                <th className="p-2">Máquina</th> {/* Nueva columna para la máquina */}
                <th className="p-2">Creado</th>
                {role === "admin" && <th className="p-2">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt="Producto"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <span className="text-gray-400 italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.description}</td>
                  <td className="p-2">{p.sku}</td>
                  <td className="p-2">{p.stock}</td>
                  <td className="p-2">{p.price ?? "$0.00"}</td>
                  <td className="p-2">{p.barcode}</td>
                  <td className="p-2">{p.expiration_date || "No especificada"}</td> {/* Mostrar la fecha de expiración */}
                  <td className="p-2">
                    {/* Mostrar la máquina asociada */}
                    {machines.find((machine) => machine.id === p.machine_id)?.name || "No asignada"}
                  </td>
                  <td className="p-2">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                  </td>
                  {role === "admin" && (
                    <td className="p-2 space-x-2">
                      <button
                        className="text-blue-500 hover:underline"
                        onClick={() => navigate(`/admin/products/edit/${p.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-500 hover:underline"
                        onClick={() => handleDelete(p.id)}
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
      </div>
    </div>
  );
}
