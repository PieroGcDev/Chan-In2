import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

export default function ScannerPage() {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const handleScanSuccess = async (decodedText) => {
    try {
      const products = await fetchProducts();
      const foundProduct = products.find(p => p.barcode === decodedText);

      if (foundProduct) {
        setScannedProducts(prev => [
          ...prev,
          { ...foundProduct, scannedCode: decodedText }
        ]);
        setStatusMessage({ text: "Producto encontrado ✔", type: "success" });
      } else {
        setScannedProducts(prev => [
          ...prev,
          { name: "No encontrado", scannedCode: decodedText }
        ]);
        setStatusMessage({ text: "Producto no encontrado ❌", type: "error" });
      }

      setTimeout(() => setStatusMessage(null), 3000);

    } catch (error) {
      console.error("Error al buscar producto:", error);
      setStatusMessage({ text: "Error al buscar producto", type: "error" });
    }
  };

  const startScanner = () => {
    if (!scannerInstanceRef.current) {
      scannerInstanceRef.current = new Html5Qrcode("reader");
      scannerInstanceRef.current
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          handleScanSuccess
        )
        .catch((err) => console.error("Error al iniciar escáner:", err));
      setScannerActive(true);
    }
  };

  const stopScanner = () => {
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current
        .stop()
        .then(() => {
          scannerInstanceRef.current.clear();
          scannerInstanceRef.current = null;
          setScannerActive(false);
        })
        .catch((err) => console.error("Error al detener escáner:", err));
    }
  };

  useEffect(() => {
    return () => {
      // Siempre detener al desmontar la página
      stopScanner();
    };
  }, []);

  const handleClear = () => {
    setScannedProducts([]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">Escáner de Productos</h2>

      {statusMessage && (
        <div
          className={`p-3 mb-4 rounded ${
            statusMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {!scannerActive ? (
        <button
          onClick={startScanner}
          className="mb-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
        >
          Iniciar escaneo
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="mb-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
        >
          Detener escaneo
        </button>
      )}

      {/* Contenedor del escáner */}
      <div
        id="reader"
        className="mx-auto mb-6"
        style={{
          width: scannerActive ? "100%" : "0",
          maxWidth: "400px",
          height: scannerActive ? "300px" : "0",
          overflow: "hidden",
        }}
      ></div>

      <div className="flex justify-between items-center mb-4">
        <span className="font-medium">Productos escaneados: {scannedProducts.length}</span>
        <button onClick={handleClear} className="bg-primary text-white py-1 px-4 rounded hover:bg-primary-dark">
          Limpiar
        </button>
      </div>

      {scannedProducts.length > 0 && (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2">Código</th>
                <th className="p-2">Nombre</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Precio</th>
              </tr>
            </thead>
            <tbody>
              {scannedProducts.map((p, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p.scannedCode}</td>
                  <td className="p-2">{p.name ?? "—"}</td>
                  <td className="p-2">{p.sku ?? "—"}</td>
                  <td className="p-2">{p.stock ?? "—"}</td>
                  <td className="p-2">{p.price ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
