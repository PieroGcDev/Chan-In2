import React, { useState, useEffect } from "react";
import axios from "axios";

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precio, setPrecio] = useState("");

  useEffect(() => {
    console.log("Ejecutando useEffect para cargar productos...");
    axios
      .get("http://localhost:3001/productos")
      .then((response) => {
        console.log("Datos recibidos desde la API:", response.data);
        setProductos(response.data);
      })
      .catch((error) => {
        console.error("Error al cargar los productos:", error);
      });
  }, []);

  const agregarProducto = () => {
    const nuevoProducto = { codigo, descripcion, cantidad, precio };
    axios
      .post("/api/productos", nuevoProducto)
      .then((response) => {
        setProductos([...productos, response.data]);
        limpiarFormulario();
      })
      .catch((error) => {
        console.error("Error al agregar el producto:", error);
      });
  };

  const limpiarFormulario = () => {
    setCodigo("");
    setDescripcion("");
    setCantidad("");
    setPrecio("");
  };

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <span className="mr-2">Hola, Abastecedor</span>
      </div>
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Buscar producto"
          className="flex-1 border rounded px-2 py-1 mr-2"
        />
        <button className="bg-yellow-500 text-white px-4 py-2 rounded">
          Buscar
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded ml-2">
          Usar Lector IRI
        </button>
        <button className="bg-yellow-500 text-white px-4 py-2 rounded ml-2">
          Limpiar
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="border rounded p-4">
          <img
            src="path_to_product_image.jpg"
            alt="Producto"
            className="w-24 h-24 mx-auto mb-2"
          />
          <h2 className="text-xl font-bold mb-2">Producto</h2>
          <p className="mb-2">
            Descripción: Bebida gasificada sabor caramelo y chocolate
          </p>
          <p className="mb-2">Unidades disponibles: 24</p>
          <p className="mb-2">Contenido Neto: 500 ml</p>
          <p className="mb-2">Precio Venta: S/ 3.00</p>
          <div className="flex items-center mb-2">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded mr-2">
              -
            </button>
            <span className="mr-2">2</span>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded">
              +
            </button>
          </div>
          <button className="bg-yellow-500 text-white px-4 py-2 rounded w-full">
            Añadir
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Código</th>
              <th className="py-2 px-4 border-b">Descripción</th>
              <th className="py-2 px-4 border-b">Cantidad</th>
              <th className="py-2 px-4 border-b">Precio</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.codigo}>
                <td className="py-2 px-4 border-b">{producto.codigo}</td>
                <td className="py-2 px-4 border-b">{producto.descripcion}</td>
                <td className="py-2 px-4 border-b">{producto.cantidad}</td>
                <td className="py-2 px-4 border-b">{producto.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventario;
