import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

export default function ScannerPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);

  // Iniciar el escaneo
  const handleStartScanner = () => {
    if (scanner) return; // Evitar duplicación

    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      },
      /* verbose= */ false
    );

    newScanner.render(
      async (decodedText) => {
        const alreadyScanned = scannedProducts.find(p => p.barcode === decodedText);
        if (alreadyScanned) return; // Evitar duplicados exactos en la tabla

        try {
          const products = await fetchProducts();
          const foundProduct = products.find((p) => p.barcode === decodedText);

          if (foundProduct) {
            setScannedProducts((prev) => [...prev, foundProduct]);
          } else {
            setScannedProducts((prev) => [
              ...prev,
              { name: "Producto no encontrado", barcode: decodedText },
            ]);
          }
        } catch (error) {
          console.error("Error al buscar producto:", error);
        }
      },
      (error) => {
        console.warn("Error escaneo:", error);
      }
    );

    setScanner(newScanner);
    setScannerActive(true);
  };

  // Detener escaneo
  const handleStopScanner = async () => {
    if (scanner) {
      await scanner.clear();
      setScanner(null);
      setScannerActive(false);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanner]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-bg-light">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow animate-fade-in">
        <h2 className="text-2xl font-bold text-primary mb-4 text-center">Escaneo de Producto</h2>

        {/* Botones */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center">
          <button
            onClick={handleStartScanner}
            disabled={scannerActive}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded w-full md:w-auto transition"
          >
            Iniciar Escaneo
          </button>
          <button
            onClick={handleStopScanner}
            disabled={!scannerActive}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded w-full md:w-auto transition"
          >
            Detener Escaneo
          </button>
        </div>

        {/* Cámara */}
        <div id="qr-reader" className="w-full mx-auto max-w-md md:max-w-lg bg-gray-100 rounded shadow-md"></div>

        {/* Productos escaneados */}
        {scannedProducts.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-primary">
              Productos Escaneados ({scannedProducts.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white border rounded shadow">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Código de Barras</th>
                    <th className="p-2">Stock</th>
                    <th className="p-2">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedProducts.map((p, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.barcode}</td>
                      <td className="p-2">{p.stock ?? "—"}</td>
                      <td className="p-2">{p.price ? `$${p.price}` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
