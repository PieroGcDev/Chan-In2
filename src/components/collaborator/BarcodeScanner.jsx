import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = () => {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const scannerId = "reader";
    const config = { fps: 10, qrbox: 250 };
    const html5QrCode = new Html5Qrcode(scannerId);

    const startScanner = async () => {
      try {
        setScanning(true);
        await html5QrCode.start(
          { facingMode: "environment" },
          config,
          (decodedText, decodedResult) => {
            console.log("Código escaneado:", decodedText);
            html5QrCode.stop().then(() => {
              setScanning(false);
            });
          }
        );
      } catch (err) {
        console.error("Error al iniciar el escáner:", err);
        setError("No se pudo acceder a la cámara o iniciar el escáner.");
      }
    };

    startScanner();

    return () => {
      if (scanning) {
        html5QrCode.stop().catch((err) => {
          console.warn("Error al detener el escáner:", err);
        });
      }
    };
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Escanea un producto</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div id="reader" style={{ width: "100%", maxWidth: "500px" }} />
    </div>
  );
};

export default BarcodeScanner;
