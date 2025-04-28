// src/pages/ProductList.jsx
import React, { useEffect, useState } from 'react';
import { getProducts, deleteProduct } from '../services/productService';
import { useNavigate } from 'react-router-dom';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al obtener los productos:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      fetchProducts(); // Actualiza la lista tras eliminar
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Productos</h2>
      <button 
        className="bg-green-500 text-white px-4 py-2 mb-4 rounded" 
        onClick={() => navigate('/admin/products/new')}
      >
        Agregar Producto
      </button>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Stock</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((prod) => (
            <tr key={prod.id}>
              <td className="border p-2">{prod.id}</td>
              <td className="border p-2">{prod.name}</td>
              <td className="border p-2">{prod.stock}</td>
              <td className="border p-2">
                <button 
                  className="bg-blue-500 text-white px-2 py-1 mr-2 rounded" 
                  onClick={() => navigate(`/admin/products/edit/${prod.id}`)}
                >
                  Editar
                </button>
                <button 
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(prod.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
