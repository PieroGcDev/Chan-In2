import React, { useEffect, useState } from "react";
import { fetchProducts, updateProductStock } from "../services/productService"; // Importamos updateProductStock para modificar el stock
import { assignProductToMachine } from "../services/machineService"; 
import { useNavigate, useParams } from "react-router-dom";

export default function AssignProductsPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({}); // Para almacenar las cantidades asignadas por producto
  const [loading, setLoading] = useState(true);

  // Cargar los productos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Manejar selección de producto
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Manejar cantidad ingresada
  const handleQuantityChange = (productId, quantity) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  // Manejo del submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Asignar productos y actualizar stock
      await Promise.all(
        selectedProducts.map((productId) => {
          const quantity = quantities[productId] || 1; // Default quantity to 1 if none entered
          assignProductToMachine(machineId, productId, quantity);
          updateProductStock(productId, quantity); // Actualizar stock en la tabla de productos
        })
      );

      navigate(`/machines/${machineId}/products`);
    } catch (error) {
      console.error("Error al asignar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Asignar Productos a Máquina</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <h3 className="text-xl">Selecciona los productos:</h3>
          {products.map((product) => {
            // Filtramos los productos que ya están asignados a la máquina
            if (product.machine_id === machineId) {
              return (
                <div key={product.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={product.id}
                    value={product.id}
                    disabled // Deshabilitar si ya está asignado
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="mr-2"
                  />
                  <label htmlFor={product.id}>{product.name}</label>
                  <span className="ml-2 text-gray-500">(Producto ya asignado)</span>
                </div>
              );
            }
            return (
              <div key={product.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={product.id}
                  value={product.id}
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  className="mr-2"
                />
                <label htmlFor={product.id}>{product.name}</label>

                {/* Permitir ingresar la cantidad */}
                {selectedProducts.includes(product.id) && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="ml-2 border p-1 rounded w-24"
                  />
                )}
              </div>
            );
          })}
        </div>
        <button type="submit" className="bg-primary text-white py-2 px-4 rounded mt-4">
          Asignar productos
        </button>
      </form>
    </div>
  );
}
