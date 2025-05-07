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
import { useUser } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { user } = useUser();
  const role = user?.role || user?.fk_roles?.name || "guest";

  if (user === undefined) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      {user && <Navbar role={role} />}
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute role={["admin", "colaborator"]}>
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

        <Route
          path="/reports"
          element={
            <ProtectedRoute role={["admin", "colaborator"]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
