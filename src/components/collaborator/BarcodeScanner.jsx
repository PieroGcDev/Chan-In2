import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

const BarcodeScanner = () => {
  const scannerRef = useRef(null);
  const [html5QrCode, setHtml5QrCode] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  const scannerId = "reader";
  const config = { fps: 10, qrbox: 250 };

  const startScanner = async () => {
    try {
      const qrCodeScanner = new Html5Qrcode(scannerId);
      setHtml5QrCode(qrCodeScanner);
      setScanning(true);
      await qrCodeScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setCode(decodedText);
          stopScanner(); // detener automáticamente luego de leer
        }
      );
    } catch (err) {
      console.error("Error al iniciar la cámara:", err);
      setError("No se pudo acceder a la cámara.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCode && scanning) {
      try {
        await html5QrCode.stop();
        await html5QrCode.clear();
        setScanning(false);
      } catch (err) {
        console.warn("Error al detener el escáner:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  return (
    <div className="max-w-md">
      <h2 className="text-xl font-bold mb-4">Escanear Producto</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="flex space-x-2 mb-4">
        {!scanning && (
          <button onClick={startScanner} className="bg-green-500 text-white px-4 py-2 rounded">
            Iniciar escáner
          </button>
        )}
        {scanning && (
          <button onClick={stopScanner} className="bg-red-500 text-white px-4 py-2 rounded">
            Detener escáner
          </button>
        )}
      </div>

      <div id={scannerId} className="w-full mb-4" />

      {code && (
        <div className="mt-4">
          <label className="block text-gray-700 mb-1">Código escaneado:</label>
          <input
            type="text"
            readOnly
            value={code}
            className="border rounded p-2 w-full"
          />
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;
