import React from "react";
import Navbar from "../Navbar"; // Asegúrate que esta ruta sea correcta
import BarcodeScanner from "../../components/collaborator/BarcodeScanner";

const CollaboratorPanel = () => {
  return (
    <div>
      <main className="p-6">
        <BarcodeScanner />
      </main>
    </div>
  );
};

export default CollaboratorPanel;
