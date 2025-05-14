import React, { useState, useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

export default function ScannerPage() {
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedProducts, setScannedProducts] = useState([]);
  const [scanner, setScanner] = useState(null);
  const scannedCodesRef = useRef(new Set());

  const handleStartScanner = () => {
    if (scanner) return;

    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: (vw, vh) => {
            const minEdge = Math.min(vw, vh);
            const size = minEdge * 0.6; // Ajuste dinámico
            return { width: size, height: size };
            },
        },
      false
    );

    newScanner.render(
      async (decodedText) => {
        if (scannedCodesRef.current.has(decodedText)) {
          console.log("Código ya escaneado, ignorando:", decodedText);
          return;
        }

        scannedCodesRef.current.add(decodedText);

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

  const handleStopScanner = async () => {
    if (scanner) {
      await scanner.clear();
      setScanner(null);
      setScannerActive(false);
      // Si deseas limpiar los códigos al detener:
      // scannedCodesRef.current.clear();
    }
  };

  const handleClearResults = () => {
    setScannedProducts([]);
    scannedCodesRef.current.clear();
  };

  useEffect(() => {
    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanner]);

  return (
    <div className="min-h-screen p-6 bg-bg-light">
      <h1 className="text-2xl font-bold text-primary mb-4 text-center">
        Escaneo de Producto
      </h1>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {!scannerActive && (
            <button
              onClick={handleStartScanner}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded shadow"
            >
              Iniciar Escaneo
            </button>
          )}
          {scannerActive && (
            <button
              onClick={handleStopScanner}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded shadow"
            >
              Detener Escaneo
            </button>
          )}
          <button
            onClick={handleClearResults}
            className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded shadow"
          >
            Limpiar Resultados
          </button>
        </div>

        <div
          id="qr-reader"
          className="rounded-lg shadow-lg overflow-hidden bg-black w-full max-w-md aspect-square"
        ></div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2 text-primary">
          Productos Escaneados: {scannedProducts.length}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-lg overflow-hidden">
            <thead className="bg-primary text-white">
              <tr>
                <th className="p-2">Nombre</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Código</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Precio</th>
              </tr>
            </thead>
            <tbody>
              {scannedProducts.map((product, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-all"
                >
                  <td className="p-2">{product.name}</td>
                  <td className="p-2">{product.sku ?? "—"}</td>
                  <td className="p-2">{product.barcode}</td>
                  <td className="p-2">{product.stock ?? "—"}</td>
                  <td className="p-2">
                    {product.price ? `$${product.price}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
