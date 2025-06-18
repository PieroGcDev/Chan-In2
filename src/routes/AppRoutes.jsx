import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProductsPage from "../pages/ProductsPage";
import MachinesPage from "../pages/MachinesPage";
import UsersPage from "../pages/UsersPage";
import ReportsPage from "../pages/ReportsPage";
import ProductForm from "../components/ProductForm";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";
import ResetPassword from "../pages/ResetPassword";
import { useUser } from "../contexts/UserContext";
import ScannerPage from "../pages/ScannerPage";
import MachineForm from "../pages/MachineForm";
import MachineProductsPage from "../pages/MachineProductsPage"; // Ajusta la ruta según sea necesario

export const AppRoutes = () => {
  const { user, loading } = useUser();
  const isAuthenticated = !!user;
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl font-semibold">Cargando...</p>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && location.pathname !== "/login" && (
        <Navbar role={user.role} />
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scanner"
          element={
            <ProtectedRoute role="colaborador">
              <ScannerPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute role={["admin","colaborador"]}>
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
            <ProtectedRoute role={["admin","colaborador"]}>
              <MachinesPage />
            </ProtectedRoute>
          }
        />

        <Route path="/machines/:machineId/products" component={MachineProductsPage} />

        <Route
          path="/machines/edit/:id"
          element={
            <ProtectedRoute role="admin">
              <MachineForm />
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
        <Route
          path="/reports"
          element={
            <ProtectedRoute role={["admin","colaborador"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </>
  );
};