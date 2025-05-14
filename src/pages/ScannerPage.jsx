import React, { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { fetchProducts } from "../services/productService";

function ScannerPage() {
  const [scannedProducts, setScannedProducts] = useState([]);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    return () => {
      if (scanner) {
        scanner.clear().catch((error) => console.error("Error al limpiar escáner", error));
      }
    };
  }, [scanner]);

  const handleScan = async (code) => {
    if (scannedProducts.some((p) => p.barcode === code)) {
      console.log("Código ya escaneado:", code);
      return;
    }

    try {
      const products = await fetchProducts();
      const product = products.find((p) => p.barcode === code);

      const newProduct = product
        ? { ...product, found: true }
        : { barcode: code, name: "Producto no encontrado", found: false };

      setScannedProducts((prev) => [...prev, newProduct]);
    } catch (error) {
      console.error("Error buscando producto:", error);
    }
  };

  const startScanner = () => {
    if (scanner) {
      scanner.render();
      return;
    }

    const html5QrCode = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 300, height: 300 }, // Ajuste cuadrado en móvil y PC
      aspectRatio: 1.0,
    });

    html5QrCode.render(
      (decodedText) => {
        handleScan(decodedText);
      },
      (error) => {
        // Ignorar errores de escaneo para evitar spam en consola
      }
    );

    setScanner(html5QrCode);
  };

  const stopScanner = () => {
    if (scanner) {
      scanner.clear().then(() => setScanner(null));
    }
  };

  const clearScanned = () => setScannedProducts([]);

  return (
    <div className="min-h-screen bg-bg-light p-4 flex flex-col gap-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-primary text-center">Escáner de Productos</h2>

      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <button
          onClick={startScanner}
          className="bg-primary hover:bg-primary-dark text-white font-semibold px-6 py-2 rounded transition"
        >
          Iniciar Escaneo
        </button>
        <button
          onClick={stopScanner}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-2 rounded transition"
        >
          Detener Escaneo
        </button>
        <button
          onClick={clearScanned}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded transition"
        >
          Limpiar Resultados
        </button>
      </div>

      <div id="reader" className="mx-auto max-w-sm aspect-square bg-black rounded-lg overflow-hidden shadow-lg" />

      <div className="mt-8 bg-white shadow rounded-lg overflow-hidden">
        <h3 className="text-lg font-semibold bg-primary text-white p-4">Productos Escaneados: {scannedProducts.length}</h3>
        <ul className="divide-y divide-gray-200">
          {scannedProducts.map((p, index) => (
            <li key={index} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-gray-50">
              <div>
                <p className="font-bold text-gray-800">{p.name}</p>
                <p className="text-sm text-gray-600">Código: {p.barcode}</p>
              </div>
              {p.found && (
                <div className="text-sm text-green-600 mt-2 md:mt-0">
                  Stock: {p.stock} | Precio: ${p.price ?? 0.0}
                </div>
              )}
              {!p.found && (
                <div className="text-sm text-red-500 mt-2 md:mt-0">No encontrado en la base</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ScannerPage;
