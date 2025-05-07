import React, { useEffect, useState } from "react";
import { fetchProducts, deleteProduct } from "../services/productService";
import { useNavigate } from "react-router-dom";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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
      await loadProducts(); // refrescar la tabla
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Gestión de Productos</h2>
        <button
          onClick={() => navigate("/admin/products/new")}
          className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
        >
          Añadir Producto
        </button>
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
              <th className="p-2">Nombre</th>
              <th className="p-2">Descripción</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Código de barras</th>
              <th className="p-2">Creado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.description}</td>
                <td className="p-2">{p.sku}</td>
                <td className="p-2">{p.stock}</td>
                <td className="p-2">{p.price ?? "$0.00"}</td>
                <td className="p-2">{p.barcode}</td>
                <td className="p-2">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
                </td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
