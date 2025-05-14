import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

function Dashboard() {
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState(null);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  const startScanner = () => {
    if (html5QrCodeRef.current) return; // evitar múltiples instancias

    const config = { fps: 10, qrbox: 250, formatsToSupport: ["CODE_128", "EAN_13", "EAN_8", "UPC_A", "UPC_E"] };
    const html5QrCode = new Html5Qrcode("scanner");
    html5QrCodeRef.current = html5QrCode;

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      async (decodedText) => {
        setCode(decodedText);
        html5QrCode.stop().then(() => {
          html5QrCode.clear();
          html5QrCodeRef.current = null;
        });

        // Buscar producto en Supabase por barcode
        try {
          const allProducts = await fetchProducts();
          const found = allProducts.find((p) => p.barcode === decodedText);
          if (found) {
            setProduct(found);
            setError(null);
          } else {
            setProduct(null);
            setError("Producto no encontrado en la base de datos.");
          }
        } catch (e) {
          console.error(e);
          setError("Error buscando el producto.");
        }
      },
      (errorMessage) => {
        console.warn("No detectado:", errorMessage);
      }
    ).catch((err) => console.error("Error al iniciar el escáner:", err));

    setScanning(true);
  };

  const stopScanner = () => {
    if (html5QrCodeRef.current) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      });
    }
    setScanning(false);
    setCode(null);
    setProduct(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-primary">Escaneo de Producto</h2>
      {!scanning ? (
        <button onClick={startScanner} className="bg-primary text-white px-4 py-2 rounded">
          Iniciar escaneo
        </button>
      ) : (
        <button onClick={stopScanner} className="bg-red-600 text-white px-4 py-2 rounded">
          Detener escaneo
        </button>
      )}

      <div id="scanner" className="mt-4 w-full max-w-md"></div>

      {code && (
        <div className="mt-6">
          <p className="font-semibold text-gray-700">Código escaneado: {code}</p>
          {product ? (
            <div className="mt-4 bg-green-100 p-4 rounded shadow">
              <h3 className="text-xl font-bold text-green-700">{product.name}</h3>
              <p>SKU: {product.sku}</p>
              <p>Stock: {product.stock}</p>
              <p>Precio: {product.price}</p>
            </div>
          ) : (
            <p className="text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
