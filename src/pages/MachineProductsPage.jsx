// src/pages/MachineProductsPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMachineProducts } from "../services/productService"; // Importa tu servicio de productos (ajusta si es necesario)

export default function MachineProductsPage() {
  const { machineId } = useParams(); // Obtener el ID de la máquina desde la URL
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchMachineProducts(machineId); // Consulta los productos desde Supabase o tu API
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar los productos:", error.message);
      }
    };
    
    loadProducts();
  }, [machineId]);

  return (
    <div className="container mx-auto p-6 bg-white rounded shadow animate-fade-in">
      <h2 className="text-2xl font-bold text-primary">Productos de la Máquina</h2>
      
      <div className="overflow-x-auto mt-4">
        <table className="w-full bg-white rounded shadow text-sm border">
          <thead className="bg-primary text-white text-center">
            <tr>
              <th className="p-3 border">Producto</th>
              <th className="p-3 border">Stock</th>
            </tr>
          </thead>
          <tbody className="text-center">
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="p-3 border">{product.name}</td>
                <td className="p-3 border">{product.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
