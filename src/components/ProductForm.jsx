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
    stock: '',
    description: '',
    barcode: '',
    price: ''
  });

  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct({
          name: data.name || '',
          sku: data.sku || '',
          stock: data.stock ?? '',
          description: data.description || '',
          barcode: data.barcode || '',
          price: data.price ?? ''
        });
      } catch (err) {
        console.error("Error al cargar producto:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: name === 'stock' || name === 'price' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  // Validaciones básicas antes de enviar
  if (!product.name.trim() || !product.sku.trim() || product.stock === '') {
    alert("Por favor completa los campos obligatorios: Nombre, SKU, Stock.");
    return;
  }

  try {
    // Preparar datos limpios
    const updatedProduct = {
      name: product.name.trim(),
      sku: product.sku.trim(),
      barcode: product.barcode.trim() || null,
      stock: parseInt(product.stock) || 0,
      price: product.price !== '' ? parseFloat(product.price) : null,
      description: product.description.trim() || null
    };

    if (id) {
      const result = await updateProduct(id, updatedProduct);
      if (result) {
        console.log("Producto actualizado:", result);
      } else {
        console.error("No se actualizó el producto, respuesta vacía.");
      }
    } else {
      const result = await addProduct(updatedProduct);
      if (result) {
        console.log("Producto creado:", result);
      }
    }

    navigate("/products", { replace: true });
  } catch (error) {
    console.error("Error al guardar el producto:", error.message || error);
    alert("Error al guardar el producto.");
  }
};


  if (loading) return <p className="p-4">Cargando formulario...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? "Editar Producto" : "Nuevo Producto"}</h2>
      <form onSubmit={handleSubmit}>
        {["name", "sku", "barcode", "stock", "price", "description"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block text-gray-700 capitalize">{field === "sku" ? "SKU" : field}</label>
            {field === "description" ? (
              <textarea
                name={field}
                value={product[field]}
                onChange={handleChange}
                className="border rounded p-2 w-full"
              />
            ) : (
              <input
                type={field === "stock" || field === "price" ? "number" : "text"}
                name={field}
                value={product[field]}
                onChange={handleChange}
                className="border rounded p-2 w-full"
                step={field === "price" ? "0.01" : undefined}
                required={["name", "sku", "stock"].includes(field)}
              />
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
