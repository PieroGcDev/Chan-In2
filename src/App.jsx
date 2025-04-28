import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import MachinesPage from "./pages/MachinesPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import Navbar from "./components/navbar"; // Asegúrate que la ruta es correcta
import { useUser } from "./contexts/UserContext"; // Agregado

function App() {
  const { user } = useUser();
  const role = user?.role || "guest"; // default guest si no está logueado

  if (user === undefined) return <div>Loading...</div>; // Agregar un loading mientras se resuelve el estado

  return (
    <BrowserRouter>
      {user && <Navbar role={role} />}
      <Routes>
        <Route path="/login" element={<Login />} />
        {user && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            {role === "admin" && <Route path="/products" element={<ProductsPage />} />}
            {role === "admin" && <Route path="/machines" element={<MachinesPage />} />}
            {role === "admin" && <Route path="/users" element={<UsersPage />} />}
            {(role === "admin" || role === "colaborator") && (
              <Route path="/reports" element={<ReportsPage />} />
            )}
          </>
        )}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
