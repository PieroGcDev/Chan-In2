import React, { useState, useRef, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

export default function ScannerPage() {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [scannerActive, setScannerActive] = useState(false);
  const scannerInstanceRef = useRef(null);
  const scannedCodesRef = useRef(new Set());

  const handleScanSuccess = async (decodedText) => {
    if (scannedCodesRef.current.has(decodedText)) return;

    scannedCodesRef.current.add(decodedText);

    try {
      const products = await fetchProducts();
      const foundProduct = products.find((p) => p.barcode === decodedText);

      if (foundProduct) {
        setScannedProducts((prev) => [
          ...prev,
          { ...foundProduct, scannedCode: decodedText },
        ]);
        setStatusMessage({ text: "Producto encontrado ✔", type: "success" });
      } else {
        setScannedProducts((prev) => [
          ...prev,
          { name: "No encontrado", scannedCode: decodedText },
        ]);
        setStatusMessage({ text: "Producto no encontrado ❌", type: "error" });
      }

      setTimeout(() => setStatusMessage(null), 3000);
    } catch (error) {
      console.error("Error al buscar producto:", error);
      setStatusMessage({ text: "Error al buscar producto", type: "error" });
      setTimeout(() => setStatusMessage(null), 3000);
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
            qrbox: { width: 280, height: 280 },
            aspectRatio: 1.0,
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
    return () => stopScanner();
  }, []);

  const handleClear = () => {
    setScannedProducts([]);
    scannedCodesRef.current.clear();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 space-y-4">
      <h2 className="text-xl font-bold text-primary">Escáner de Productos</h2>

      {statusMessage && (
        <div
          className={`p-3 rounded animate-fade-in ${
            statusMessage.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {!scannerActive ? (
        <button
          onClick={startScanner}
          className="w-full bg-primary text-white py-2 px-4 rounded-lg shadow hover:bg-primary-dark"
        >
          Iniciar escaneo
        </button>
      ) : (
        <button
          onClick={stopScanner}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg shadow hover:bg-red-700"
        >
          Detener escaneo
        </button>
      )}

      <div
        id="reader"
        className="rounded-lg overflow-hidden shadow"
        style={{
          width: scannerActive ? "90%" : "0",
          height: scannerActive ? "300px" : "0",
          transition: "all 0.3s ease-in-out",
        }}
      ></div>

      {scannedProducts.length > 0 && (
        <>
          <div className="w-full flex justify-between items-center mt-4">
            <span className="font-semibold">
              Productos escaneados: {scannedProducts.length}
            </span>
            <button
              onClick={handleClear}
              className="bg-primary text-white py-1 px-3 rounded hover:bg-primary-dark"
            >
              Limpiar
            </button>
          </div>

          <div className="w-full bg-white rounded-lg shadow overflow-x-auto mt-2 animate-fade-in">
            <table className="w-full text-sm">
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
        </>
      )}
    </div>
  );
}
