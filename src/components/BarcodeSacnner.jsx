// src/components/BarcodeScanner.jsx
import { useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

function BarcodeScanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        console.log("Código escaneado:", decodedText);
        onScanSuccess(decodedText); // Llama a la función pasada por props
        scanner.clear(); // Detiene el escáner después de escanear 1 vez
      },
      (error) => {
        console.warn("Error de escaneo", error);
      }
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScanSuccess]);

  return <div id="reader" className="w-full max-w-md mx-auto mt-4" />;
}

export default BarcodeScanner;
