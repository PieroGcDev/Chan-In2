import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMachineProducts } from "../services/productService"; // Asegúrate de que esta función esté correctamente definida en tu servicio

export default function MachineProductsPage() {
  const { machineId } = useParams(); // Obtener el ID de la máquina desde la URL
  const [products, setProducts] = useState([]);  // Para almacenar los productos asignados
  const [loading, setLoading] = useState(true);   // Para manejar el estado de carga
  const [error, setError] = useState(null);       // Para manejar los posibles errores

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Llamamos a la función para obtener los productos de la máquina desde el servicio
        const data = await fetchMachineProducts(machineId); 
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar los productos:", error.message);
        setError("No se pudieron cargar los productos asignados a esta máquina.");
      } finally {
        setLoading(false); // Finalizamos el estado de carga
      }
    };
    
    loadProducts();
  }, [machineId]);

  if (loading) {
    return <div>Loading...</div>;  // Muestra un mensaje de carga mientras los productos se cargan
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;  // Muestra un mensaje de error si no se pueden cargar los productos
  }

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
                <td className="p-3 border">{product.assigned_stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
