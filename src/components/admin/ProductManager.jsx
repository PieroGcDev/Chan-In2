import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productService";

function ProductManager() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchProducts().then(setItems).catch(console.error);
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Gestión de Productos</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white border-collapse">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Stock</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="hover:bg-bg-light">
                <td className="p-3">{i.name}</td>
                <td className="p-3">{i.sku}</td>
                <td className="p-3">{i.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductManager;
