import React, { useEffect, useState } from "react";
import { fetchMachines } from "../services/machineservices";

export default function MachinesPage() {
  const [machines, setMachines] = useState([]);

  useEffect(() => {
    fetchMachines().then(setMachines).catch(console.error);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary">Gestión de Máquinas</h2>
        <button className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded">
          Añadir Máquina
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded shadow">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Código</th>
              <th className="p-3">Asignado a</th>
              <th className="p-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="p-3">{m.name}</td>
                <td className="p-3">{m.code}</td>
                <td className="p-3">{m.assignee?.profiles?.nombre ?? "—"}</td>
                <td className="p-3">{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
