// src/services/reportService.js
import { supabase } from "../supabaseClient";

// reportType: "employees" | "machines" | "annualValue"
// dateFrom, dateTo: strings YYYY-MM-DD
export async function generateReport({ reportType, dateFrom, dateTo }) {
  switch (reportType) {
    case "employees":
      return fetchEmployeesReport(dateFrom, dateTo);
    case "machines":
      return fetchMachinesReport(dateFrom, dateTo);
    case "annualValue":
      return fetchAnnualValueReport(dateFrom, dateTo);
    default:
      throw new Error("Tipo de reporte no soportado");
  }
}

async function fetchEmployeesReport(from, to) {
  // Ejemplo: agrega tu lógica aquí
  const { data, error } = await supabase
    .from("reports_employees")
    .select("*")
    .gte("date", from)
    .lte("date", to);
  if (error) throw error;
  return data;
}

async function fetchMachinesReport(from, to) {
  const { data, error } = await supabase
    .from("reports_machines")
    .select("*")
    .gte("date", from)
    .lte("date", to);
  if (error) throw error;
  return data;
}

async function fetchAnnualValueReport(from, to) {
  // Ejemplo de agregación de valor anual
  const { data, error } = await supabase.rpc("sp_annual_value", {
    start_date: from,
    end_date: to,
  });
  if (error) throw error;
  return data;
}
