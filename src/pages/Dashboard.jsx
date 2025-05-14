import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";
import AdminPanel from "../components/admin/AdminPanel";
import CollaboratorPanel from "../components/collaborator/collaboratorPanel";
import { useNavigate } from "react-router-dom";
import { fetchProductByBarcode } from "../services/productService";
import BarcodeScannerComponent from "../components/collaborator/BarcodeScanner";

function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scannedCode, setScannedCode] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [scanError, setScanError] = useState("");
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

  const role = profile?.fk_roles?.name;

  // Buscar producto cuando cambie el código escaneado
  useEffect(() => {
    const searchProduct = async () => {
      if (scannedCode) {
        try {
          const product = await fetchProductByBarcode(scannedCode);
          setProductInfo(product);
          setScanError("");
        } catch (error) {
          setProductInfo(null);
          setScanError("Producto no encontrado en la base de datos.");
        }
      } else {
        setProductInfo(null);
        setScanError("");
      }
    };
    searchProduct();
  }, [scannedCode]);

  if (loading) return <p className="p-4">Cargando perfil...</p>;
  if (!profile) return <p className="p-4">No se encontró el perfil.</p>;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        <aside className="w-full md:w-64 bg-primary text-white p-6">
          <h3 className="text-xl font-bold mb-4">CHAN Tiendas</h3>
          <p className="mb-2">Hola, Bienvenido a su panel de control {profile.nombre}</p>
        </aside>

        <main className="flex-1 bg-bg-light p-6">
          <h1 className="text-2xl font-semibold text-secondary mb-4">Dashboard</h1>
          <p className="mb-6">
            Rol: <span className="font-medium">{role || "Desconocido"}</span>
          </p>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {role === "admin" && <AdminPanel />}
            {role === "colaborador" && (
              <>
                <CollaboratorPanel />
                <div className="mt-6">
                  <h2 className="text-lg font-bold mb-2">Escáner de Productos</h2>
                  <BarcodeScannerComponent
                    onDetected={(result) => setScannedCode(result)}
                  />
                  <div className="mt-4">
                    <p>Código detectado: <strong>{scannedCode}</strong></p>
                    {scanError && <p className="text-red-600">{scanError}</p>}
                    {productInfo && (
                      <div className="mt-4 p-4 bg-gray-100 rounded shadow">
                        <p><strong>Nombre:</strong> {productInfo.name}</p>
                        <p><strong>Descripción:</strong> {productInfo.description}</p>
                        <p><strong>Stock:</strong> {productInfo.stock}</p>
                        <p><strong>Precio:</strong> ${productInfo.price}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
