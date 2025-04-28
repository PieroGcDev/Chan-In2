import React, { useState } from "react";

export default function ReportsPage() {
  const [type, setType] = useState("stock");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState([]);

  const generate = () => {
    // Lógica de generación de reporte según `type`, `from`, `to`
    console.log(type, from, to);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-4">Reportes</h2>
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="flex gap-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="stock">Stock Actual</option>
            <option value="movements">Movimientos</option>
            <option value="machine">Abastecimiento por Máquina</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={generate}
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded"
          >
            Generar
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        {/* Aqu&iacute; renderizar tabla seg&uacute;n tipo y data */}
        <p className="text-gray-500">
          Seleccione opciones y genere un reporte.
        </p>
      </div>
    </div>
  );
}
