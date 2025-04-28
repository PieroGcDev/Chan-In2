import React from "react";
import ProductManager from "./ProductManager";

function AdminPanel() {
  return (
    <div>
      <h2 className="text-xl font-bold text-primary mb-4">
        Panel de Administrador
      </h2>
      <ProductManager />
    </div>
  );
}

export default AdminPanel;