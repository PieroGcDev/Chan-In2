// src/components/collaborator/BarcodeScanner.jsx
import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../../supabaseClient";

function BarcodeScanner() {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      async (decodedText, decodedResult) => {
        scanner.clear();
        console.log("Código escaneado:", decodedText);
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("barcode", decodedText)
          .single();

        if (error) {
          setError("Producto no encontrado");
          setScannedProduct(null);
        } else {
          setScannedProduct(data);
          setError(null);
        }
      },
      (error) => {
        console.warn("Error de escaneo:", error);
      }
    );

    return () => {
      scanner.clear().catch((e) => console.error("Error al limpiar:", e));
    };
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Escanear código de barras</h2>
      <div id="reader" ref={scannerRef} className="mb-4" />
      {error && <p className="text-red-500">{error}</p>}
      {scannedProduct && (
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">{scannedProduct.name}</h3>
          <p>{scannedProduct.description}</p>
          <p><strong>SKU:</strong> {scannedProduct.sku}</p>
          <p><strong>Stock:</strong> {scannedProduct.stock}</p>
        </div>
      )}
    </div>
  );
}

export default BarcodeScanner;
