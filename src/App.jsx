import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import MachinesPage from "./pages/MachinesPage";
import UsersPage from "./pages/UsersPage";
import ReportsPage from "./pages/ReportsPage";
import ProductForm from "./components/ProductForm";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ResetPassword from "./pages/ResetPassword"; // ← NUEVO
import { useUser } from "./contexts/UserContext";

function App() {
  const { user } = useUser();
  const isAuthenticated = !!user;

  return (
    <BrowserRouter>
      {/* Solo muestra la navbar si está autenticado */}
      {isAuthenticated && <Navbar role={user.role} />}

      <Routes>
        {/* Páginas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} /> {/* ← NUEVO */}

        {/* Página privada general */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Rutas de administrador */}
        <Route
          path="/products"
          element={
            <ProtectedRoute role="admin">
              <ProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute role="admin">
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/machines"
          element={
            <ProtectedRoute role="admin">
              <MachinesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute role="admin">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Reportes accesible por admin o colaborador */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute role="colaborator">
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
