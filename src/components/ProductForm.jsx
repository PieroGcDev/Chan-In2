// src/components/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { createProduct, updateProduct, getProducts } from '../services/productService';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ProductForm() {
  const { id } = useParams(); // Si id existe, estamos en modo edición
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    stock: 0,
    // Agregar más campos como precio, descripción, etc.
  });

  useEffect(() => {
    if (id) {
      // Si es edición, obtén los datos del producto para rellenar el formulario
      // Esto asume que tienes un endpoint para obtener un producto por id
      axios.get(`http://tu-backend-url/api/products/${id}`)
        .then((res) => {
          setProduct(res.data);
        })
        .catch((error) => console.error('Error al cargar el producto:', error));
    }
  }, [id]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await updateProduct(id, product);
      } else {
        await createProduct(product);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700">Nombre del Producto</label>
          <input 
            type="text" 
            name="name" 
            value={product.name} 
            onChange={handleChange} 
            className="border rounded p-2 w-full" 
            required 
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Stock</label>
          <input 
            type="number" 
            name="stock" 
            value={product.stock} 
            onChange={handleChange} 
            className="border rounded p-2 w-full" 
            required 
          />
        </div>
        {/* Agrega más campos si son necesarios */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
}
