import React, { useEffect, useState } from "react";
import { fetchProducts } from "../services/productService";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">
          Gestión de Productos
        </h2>
        <button className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded">
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
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.sku}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.price ?? "$0.00"}</td>
                <td className="p-3 space-x-2">
                  <button className="text-blue-500">✏️</button>
                  <button className="text-red-500">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
