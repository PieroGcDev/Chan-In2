import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";
import { fetchProducts } from "../services/productService";
import { useNavigate } from "react-router-dom";
import BarcodeScannerComponent from "react-qr-barcode-scanner"; // Asumiendo que usas este

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const data = await fetchProfile(user.id);
      setProfile(data);
      setLoading(false);
    })();
  }, [navigate]);

  const handleDetected = async (result) => {
    if (result && result.text !== scannedCode) {
      setScannedCode(result.text);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("barcode", result.text)
        .single();

      if (error || !data) {
        setProductInfo(null);
      } else {
        setProductInfo(data);
      }

      setScanning(false); // Detener escaneo después de encontrar algo
    }
  };

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!profile) return <p className="p-4">No se encontró el perfil.</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        <aside className="w-full md:w-64 bg-primary text-white p-6">
          <h3 className="text-xl font-bold mb-4">CHAN Tiendas</h3>
          <p>Hola, {profile.nombre}</p>
        </aside>

        <main className="flex-1 bg-bg-light p-6">
          <h1 className="text-2xl font-semibold text-secondary mb-4">Escaneo de Producto</h1>

          {!scanning && (
            <button
              onClick={() => setScanning(true)}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
            >
              Iniciar escaneo
            </button>
          )}

          {scanning && (
            <div className="mt-4">
              <BarcodeScannerComponent
                width={400}
                height={300}
                onUpdate={(err, result) => {
                  if (result) {
                    handleDetected(result);
                  }
                }}
              />
            </div>
          )}

          {scannedCode && (
            <div className="mt-4 bg-white p-4 rounded shadow">
              <h2 className="text-lg font-bold">Código escaneado:</h2>
              <p className="font-mono">{scannedCode}</p>

              {productInfo ? (
                <div className="mt-4">
                  <h3 className="font-bold text-primary">Producto encontrado:</h3>
                  <p>Nombre: {productInfo.name}</p>
                  <p>SKU: {productInfo.sku}</p>
                  <p>Stock: {productInfo.stock}</p>
                  <p>Precio: {productInfo.price}</p>
                </div>
              ) : (
                <p className="mt-4 text-red-600">Producto no encontrado en la base de datos.</p>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
