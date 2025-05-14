import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { fetchProductByBarcode } from "../services/productService";

export default function ScannerPage() {
  const [code, setCode] = useState("");
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const qrRef = useRef(null);
  const scanner = useRef(null);

  const iniciarEscaneo = () => {
    if (scanner.current) return; // evitar doble inicialización

    scanner.current = new Html5Qrcode(qrRef.current.id);
    scanner.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      (decodedText) => {
        setCode(decodedText);
        buscarProducto(decodedText);
        detenerEscaneo();
      },
      (error) => {}
    ).catch((err) => {
      console.error("Error al iniciar cámara:", err);
    });

    setScanning(true);
  };

  const detenerEscaneo = () => {
    if (scanner.current) {
      scanner.current.stop().then(() => {
        scanner.current.clear();
        scanner.current = null;
        setScanning(false);
      });
    }
  };

  const buscarProducto = async (barcode) => {
    try {
      const data = await fetchProductByBarcode(barcode);
      setProduct(data);
      setError(null);
    } catch (err) {
      console.error("Producto no encontrado");
      setProduct(null);
      setError("Producto no encontrado");
    }
  };

  // Al salir de la página, limpiar el escáner
  useEffect(() => {
    return () => {
      detenerEscaneo();
    };
  }, []);

  return (
    <div className="container mx-auto p-6 bg-white shadow rounded animate-fade-in">
      <h2 className="text-2xl font-bold text-primary mb-6">Escaneo de Producto</h2>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="w-72 h-72 border rounded overflow-hidden shadow" id="reader" ref={qrRef}></div>

        {!scanning ? (
          <button
            onClick={iniciarEscaneo}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
          >
            Iniciar escaneo
          </button>
        ) : (
          <button
            onClick={detenerEscaneo}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
          >
            Detener escaneo
          </button>
        )}
      </div>

      {code && (
        <div className="bg-gray-100 p-4 rounded shadow mb-4">
          <p className="font-bold">Código detectado:</p>
          <p>{code}</p>
        </div>
      )}

      {product ? (
        <div className="bg-green-100 p-4 rounded shadow">
          <h3 className="text-xl font-bold mb-2">Producto encontrado</h3>
          <p><strong>Nombre:</strong> {product.name}</p>
          <p><strong>SKU:</strong> {product.sku}</p>
          <p><strong>Stock:</strong> {product.stock}</p>
          <p><strong>Precio:</strong> {product.price}</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded shadow">
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
