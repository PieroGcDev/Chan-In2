import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      setError(error.message);
    } else {
      setProducts(data);
    }
  };

  const addProduct = async () => {
    const { data, error } = await supabase.from("products").insert([
      {
        name: "Producto Test",
        description: "Test de producto",
        sku: "SKU-TEST",
        stock: 100,
        image_url: "http://imagenurl.com",
      },
    ]);
    if (error) {
      setError(error.message);
    } else {
      fetchProducts();
    }
  };

  useEffect(() => {
    // Suponiendo que antes ya verificaste que el usuario es administrador
    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Administración de Productos</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={addProduct}>Agregar Producto</button>
      <ul>
        {products &&
          products.map((prod) => (
            <li key={prod.id}>
              {prod.name} - Stock: {prod.stock}
            </li>
          ))}
      </ul>
    </div>
  );
}

export default AdminProducts;
