import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { fetchProducts } from '../services/productService';

export default function ScannerPage() {
  const [scannedCodes, setScannedCodes] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 });

    scanner.render(
      (decodedText) => handleScan(decodedText),
      (error) => console.warn(error)
    );

    return () => {
      scanner.clear().catch(console.error);
    };
  }, []);

  const handleScan = async (code) => {
    if (scannedCodes.find((c) => c.code === code)) return;

    try {
      const allProducts = await fetchProducts();
      const matched = allProducts.find((p) => p.barcode === code);

      setScannedCodes((prev) => [
        ...prev,
        {
          code,
          product: matched || null,
        },
      ]);
    } catch (error) {
      console.error('Error buscando producto:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-primary mb-4">Escaneo de Productos</h1>
      <div id="reader" className="mb-6"></div>

      <h2 className="text-lg font-semibold mb-2">Productos Escaneados:</h2>
      <table className="w-full bg-white rounded shadow text-sm">
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
          {scannedCodes.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-2">{item.code}</td>
              <td className="p-2">{item.product?.name || 'No encontrado'}</td>
              <td className="p-2">{item.product?.sku || '-'}</td>
              <td className="p-2">{item.product?.stock ?? '-'}</td>
              <td className="p-2">{item.product?.price ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
