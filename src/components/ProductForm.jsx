import React, { useState, useEffect } from 'react';
import {
  addProduct,
  updateProduct,
  fetchProductById
} from '../services/productService';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchMachines } from '../services/machineService'; // Asegúrate de tener el servicio para obtener las máquinas

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    name: '',
    sku: '',
    stock: 0,
    description: '',
    barcode: '',
    price: '',
    image_url: '',
    machine_id: '', // Agregado para almacenar la máquina seleccionada
    expiration_date: '' // Agregado para la fecha de expiración
  });

  const [machines, setMachines] = useState([]); // Estado para las máquinas
  const [loading, setLoading] = useState(!!id);

  // Cargar las máquinas disponibles
  useEffect(() => {
    const loadMachines = async () => {
      try {
        const data = await fetchMachines();
        setMachines(data);
      } catch (err) {
        console.error("Error al cargar máquinas:", err);
      }
    };
    loadMachines();
  }, []);

  // Cargar el producto para editarlo
  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (id) {
          const data = await fetchProductById(id);
          setProduct(data);
        }
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
        await updateProduct(id, product);  // Asegúrate de que expiration_date sea enviado
      } else {
        await addProduct(product);  // Asegúrate de que expiration_date sea enviado
      }
      navigate('/products'); // Redirigir a la lista de productos después de añadir o editar
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
        <div>
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
        <div>
          <label className="block text-gray-700">Código de Barras</label>
          <input
            type="text"
            name="barcode"
            value={product.barcode || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
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
        <div>
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
        <div>
          <label className="block text-gray-700">Descripción</label>
          <textarea
            name="description"
            value={product.description || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="block text-gray-700">URL de la Imagen</label>
          <input
            type="text"
            name="image_url"
            value={product.image_url || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            placeholder="https://tuservidor.com/imagen.jpg"
          />
          {product.image_url && (
            <img
              src={product.image_url}
              alt="Vista previa"
              className="w-24 h-24 object-cover rounded mt-2 border"
            />
          )}
        </div>

        {/* Menú desplegable para seleccionar la máquina */}
        <div>
          <label className="block text-gray-700">Seleccionar Máquina</label>
          <select
            name="machine_id"
            value={product.machine_id || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
            required
          >
            <option value="" disabled>Selecciona una máquina</option>
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
        </div>

        {/* Campo de fecha de expiración */}
        <div>
          <label className="block text-gray-700">Fecha de Expiración</label>
          <input
            type="date"
            name="expiration_date"
            value={product.expiration_date || ""}
            onChange={handleChange}
            className="border rounded p-2 w-full"
          />
        </div>

        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          {id ? "Actualizar" : "Crear"}
        </button>
      </form>
    </div>
  );
}
