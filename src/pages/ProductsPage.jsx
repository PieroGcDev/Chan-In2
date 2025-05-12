import React, { useEffect, useState } from "react";
import { fetchProducts, deleteProduct } from "../services/productService";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { user } = useUser();
  const role = user?.role || "guest";

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Seguro que deseas eliminar este producto?");
    if (!confirm) return;

    try {
      await deleteProduct(id);
      await loadProducts(); // refrescar
    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary mb-4 md:mb-0">Gestión de Productos</h2>
        {role === "admin" && (
          <button
            onClick={() => navigate("/admin/products/new")}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded shadow"
          >
            + Añadir Producto
          </button>
        )}
      </div>

      <div className="flex mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o SKU"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-3 border border-gray-300 rounded-l"
        />
        <button className="bg-primary hover:bg-primary-dark text-white px-4 rounded-r">
          🔍
        </button>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="w-full text-sm">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Descripción</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Precio</th>
              <th className="p-3 text-left">Código de barras</th>
              <th className="p-3 text-left">Creado</th>
              {role === "admin" && <th className="p-3">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.description}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.price ?? "$0.00"}</td>
                <td className="p-3">{p.barcode}</td>
                <td className="p-3">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </td>
                {role === "admin" && (
                  <td className="p-3 space-x-2 text-center">
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
  );
}
