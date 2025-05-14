import React, { useState } from "react";
import BarcodeScannerComponent from "react-qr-barcode-scanner";
import { supabase } from "../supabaseClient";
import { fetchProducts } from "../services/productService";

function Dashboard() {
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [product, setProduct] = useState(null);

  const handleDetected = async (result) => {
    if (result) {
      setBarcode(result.text);
      setScanning(false);

      // Buscar producto por código de barras
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", result.text)
        .single();

      if (error) {
        console.log("Producto no encontrado o error:", error.message);
        setProduct(null);
      } else {
        setProduct(data);
      }
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Escaneo de Producto</h1>
      {!scanning ? (
        <button
          onClick={() => setScanning(true)}
          className="bg-orange-600 text-white py-2 px-4 rounded"
        >
          Iniciar Escaneo
        </button>
      ) : (
        <div className="mt-4">
          <BarcodeScannerComponent
            width={500}
            height={300}
            onUpdate={(err, result) => {
              if (result) {
                handleDetected(result);
              }
            }}
          />
          <button
            onClick={() => setScanning(false)}
            className="bg-gray-400 text-white py-2 px-4 rounded mt-2"
          >
            Detener Escaneo
          </button>
        </div>
      )}

      {barcode && (
        <div className="mt-4">
          <p className="font-semibold">Código detectado: {barcode}</p>
          {product ? (
            <div className="mt-2 border p-2 rounded bg-green-100">
              <p><strong>Nombre:</strong> {product.name}</p>
              <p><strong>Stock:</strong> {product.stock}</p>
              <p><strong>Precio:</strong> {product.price}</p>
            </div>
          ) : (
            <p className="text-red-600">Producto no encontrado</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
