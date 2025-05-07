import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productService";
import { useNavigate } from "react-router-dom";

function ProductManager() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts().then(setItems).catch(console.error);
  }, []);

  return (
    <div>
      {/* Título + Botón alineados */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestión de Productos</h3>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin/products/new")}
        >
          Añadir Producto
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Precio</th> {/* Puedes eliminar si aún no usas precio */}
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-bg-light">
                <td className="p-3">{i.name}</td>
                <td className="p-3">{i.sku}</td>
                <td className="p-3">{i.stock}</td>
                <td className="p-3">{i.price}</td> {/* Igual aquí */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManager;
