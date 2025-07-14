import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { fetchProducts, deleteProduct, addProduct } from "../services/productService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { fetchMachines } from "../services/machineService";
import { AlertTriangle } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [machines, setMachines] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("name-asc");
  const navigate = useNavigate();
  const { user } = useUser();
  const role = user?.role || "guest";

  useEffect(() => {
    loadProducts();
    loadMachines();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  const loadMachines = async () => {
    try {
      const data = await fetchMachines();
      setMachines(data);
    } catch (err) {
      console.error("Error al cargar máquinas:", err);
    }
  };

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

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  const filtered = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOrder) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "date-asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "date-desc":
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

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

        <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
          <div className="flex flex-1">
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

          <div className="mt-2 md:mt-0">
            <select
              value={sortOrder}
              onChange={handleSortChange}
              className="border p-2 rounded"
            >
              <option value="name-asc">Nombre (A-Z)</option>
              <option value="name-desc">Nombre (Z-A)</option>
              <option value="price-asc">Precio (menor a mayor)</option>
              <option value="price-desc">Precio (mayor a menor)</option>
              <option value="date-desc">Más recientes</option>
              <option value="date-asc">Más antiguos</option>
            </select>
          </div>
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
                <th className="p-2">Fecha de Expiración</th>
                <th className="p-2">Máquina</th>
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
                  <td className="p-2 flex items-center gap-2">
                    {p.expiration_date ? (
                      <>
                        {new Date(p.expiration_date).toLocaleDateString()}
                        {(() => {
                          const today = dayjs();
                          const expiration = dayjs(p.expiration_date);
                          const daysLeft = expiration.diff(today, "day");
                          if (daysLeft <= 7 && daysLeft >= 0) {
                            return (
                              <span
                                title={`Vence en ${daysLeft} día${daysLeft === 1 ? "" : "s"}`}
                                className="inline-flex"
                              >
                                <AlertTriangle className="text-orange-500" size={22} />
                              </span>
                            );
                          }
                          if (daysLeft < 0) {
                            return (
                              <span title="Producto vencido" className="inline-flex">
                                <AlertTriangle className="text-red-500 animate-strongPulse" size={22} />
                              </span>
                            );
                          }
                          return null;
                        })()}
                      </>
                    ) : (
                      <span className="text-gray-400 italic">No especificada</span>
                    )}
                  </td>
                  <td className="p-2">
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
