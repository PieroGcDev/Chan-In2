import React, { useEffect, useState } from "react";
import { fetchProducts, updateProductStock } from "../services/productService";
import { assignProductToMachine, removeProductFromMachine } from "../services/machineService";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAssignedProductsToMachine } from "../services/machineService"; // Asegúrate de tener esta función

export default function AssignProductsPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignedProducts, setAssignedProducts] = useState([]);

  // Cargar los productos y los productos asignados a esta máquina
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);

        // Obtener los productos asignados a esta máquina desde Supabase
        const assignedData = await fetchAssignedProductsToMachine(machineId);
        setAssignedProducts(assignedData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [machineId]);

  // Verifica si el producto ya está asignado a la máquina
  const isProductAssigned = (productId) => {
    return assignedProducts.some((item) => item.product.id === productId);
  };

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

  // Manejo del submit (asignar productos)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Promise.all(
        selectedProducts.map(async (productId) => {
          const quantity = quantities[productId] || 1; // Default quantity to 1 if none entered

          // Primero, asignamos el producto a la máquina
          await assignProductToMachine(machineId, productId, quantity);

          // Luego, actualizamos el stock de ese producto
          await updateProductStock(productId, -quantity); // Actualizar stock en la tabla de productos
        })
      );

      // Actualizamos los productos asignados
      const updatedAssignedProducts = await fetchAssignedProductsToMachine(machineId);
      setAssignedProducts(updatedAssignedProducts);

      navigate(`/machines/${machineId}/products`);
    } catch (error) {
      console.error("Error al asignar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Desasignar producto
  const handleRemoveProduct = async (productId) => {
    try {
      // Remover producto de la máquina
      await removeProductFromMachine(machineId, productId);

      const assigned = assignedProducts.find((p) => p.product.id === productId);
      const quantityToRestore = assigned?.stock || 0;
      await updateProductStock(productId, quantityToRestore); // Restaurar stock global

      // Actualizamos los productos asignados
      const updatedAssignedProducts = await fetchAssignedProductsToMachine(machineId);
      setAssignedProducts(updatedAssignedProducts);
    } catch (error) {
      console.error("Error al desasignar producto:", error);
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
            const isAssigned = isProductAssigned(product.id);

            return (
              <div key={product.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={product.id}
                  value={product.id}
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  disabled={isAssigned} // Deshabilitar si ya está asignado
                  className="mr-2"
                />
                <label htmlFor={product.id}>{product.name}</label>

                {/* Si el producto ya está asignado, mostramos un mensaje */}
                {isAssigned && <span className="ml-2 text-gray-500">(Producto ya asignado)</span>}

                {/* Permitir ingresar la cantidad si el producto está seleccionado */}
                {!isAssigned && selectedProducts.includes(product.id) && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={quantities[product.id] || 1}
                    onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                    className="ml-2 border p-1 rounded w-24"
                  />
                )}

                {/* Si el producto ya está asignado, mostrar opción para desasignar */}
                {isAssigned && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(product.id)}
                    className="ml-2 text-red-500 hover:underline"
                  >
                    Desasignar
                  </button>
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
