import React, { useState, useEffect } from 'react';
import {
  addProduct,
  updateProduct,
  fetchProductById
} from '../services/productService';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    sku: '',
    stock: 0,
    description: '',
    barcode: '',
    price: ''
  });

  const [loading, setLoading] = useState(!!id); // solo carga si es modo edición

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Error al cargar producto:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === 'stock' || name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateProduct(id, product);
      } else {
        await addProduct(product);
      }
      navigate('/products');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  };

  if (loading) return <p className="p-4">Cargando formulario...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        {id ? "Editar Producto" : "Nuevo Producto"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre</label>
          <input
            type="text"
            name="name"
            value={product.name || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            value={product.sku || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Código de Barras</label>
          <input
            type="text"
            name="barcode"
            value={product.barcode || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Stock</label>
          <input
            type="number"
            name="stock"
            value={product.stock ?? 0}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Precio</label>
          <input
            type="number"
            name="price"
            value={product.price ?? ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            step="0.01"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
