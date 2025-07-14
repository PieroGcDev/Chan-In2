import React, { useEffect, useState } from "react";
import { fetchProducts, updateProductStock } from "../services/productService";
import {
  assignProductToMachine,
  removeProductFromMachine,
  fetchAssignedProductsToMachine,
} from "../services/machineService";
import { useNavigate, useParams } from "react-router-dom";

export default function AssignProductsPage() {
  const { machineId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignedProducts, setAssignedProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);

        const assignedData = await fetchAssignedProductsToMachine(machineId);
        console.log("✅ Productos asignados:", assignedData); // Puedes quitarlo luego
        setAssignedProducts(assignedData);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [machineId]);

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleQuantityChange = (productId, quantity) => {
    const parsed = parseInt(quantity, 10);
    setQuantities((prev) => ({
      ...prev,
      [productId]: isNaN(parsed) ? "" : parsed,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await Promise.all(
        selectedProducts.map(async (productId) => {
          const quantity = quantities[productId];
          if (typeof quantity !== "number" || quantity <= 0) {
            throw new Error("Cantidad inválida para producto " + productId);
          }

          await assignProductToMachine(machineId, productId, quantity);
          await updateProductStock(productId, -quantity);
        })
      );

      const updatedAssignedProducts = await fetchAssignedProductsToMachine(machineId);
      setAssignedProducts(updatedAssignedProducts);
      navigate(`/machines/${machineId}/products`);
    } catch (error) {
      console.error("Error al asignar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveProduct = async (productId, restoreQuantity) => {
    try {
      await removeProductFromMachine(machineId, productId);
      await updateProductStock(productId, restoreQuantity);

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
            const assignedItem = assignedProducts.find(
              (item) => item.product?.id === product.id
            );

            const isAssigned = Boolean(assignedItem);

            return (
              <div key={product.id} className="flex items-center my-2">
                <input
                  type="checkbox"
                  id={product.id}
                  value={product.id}
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => handleSelectProduct(product.id)}
                  disabled={isAssigned}
                  className="mr-2"
                />
                <label htmlFor={product.id}>{product.name}</label>

                {isAssigned && (
                  <>
                    <span className="ml-2 text-gray-500">
                      (Producto ya asignado)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveProduct(product.id, assignedItem.assigned_stock)
                      }
                      className="ml-2 text-red-500 hover:underline"
                    >
                      Desasignar
                    </button>
                  </>
                )}

                {!isAssigned && selectedProducts.includes(product.id) && (
                  <input
                    type="number"
                    min="1"
                    placeholder="Cantidad"
                    value={quantities[product.id] ?? ""}
                    onChange={(e) =>
                      handleQuantityChange(product.id, e.target.value)
                    }
                    className="ml-2 border p-1 rounded w-24"
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          className="bg-primary text-white py-2 px-4 rounded mt-4"
        >
          Asignar productos
        </button>
      </form>
    </div>
  );
}

