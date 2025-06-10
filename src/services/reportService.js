// src/services/reportService.js

import { supabase } from "../supabaseClient";

/**
 * Recupera todos los años únicos a partir de los created_at de inventory_movements.
 */
export async function fetchReportYears() {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("created_at");
  if (error) throw error;

  const years = Array.from(
    new Set(data.map((row) => new Date(row.created_at).getFullYear()))
  ).sort((a, b) => b - a);

  return years;
}

/**
 * Genera distintos tipos de reporte según reportType:
 * - "employees": agrupado por empleado
 * - "machines": agrupado por máquina (agregados)
 * - "annualValue": total monetario anual, usando product.price
 */
export async function generateReport({ reportType, dateFrom, dateTo, year }) {
  switch (reportType) {
    case "employees":
      return await _reportByDateRange("user_id", dateFrom, dateTo);

    case "machines":
      return await _reportByDateRange("machine_id", dateFrom, dateTo);

    case "annualValue": {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;

      const { data, error } = await supabase
        .from("inventory_movements")
        .select("quantity, product:product_id ( price )")
        .gte("created_at", start)
        .lte("created_at", end);

      if (error) throw error;

      const total = data.reduce((sum, row) => {
        const price = parseFloat(row.product?.price ?? 0);
        return sum + row.quantity * price;
      }, 0);

      return { year, total };
    }

    default:
      throw new Error(`Tipo de reporte desconocido: ${reportType}`);
  }
}

/**
 * Lista todas las máquinas disponibles con id y nombre.
 */
export async function fetchMachinesList() {
  const { data, error } = await supabase
    .from("machines")
    .select("id, name")
    .order("name");
  if (error) throw error;
  return data;
}

/**
 * Genera un reporte detallado para una máquina específica.
 */
export async function fetchMachineReport(machineId) {
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("id, created_at, movement_type, quantity")
    .eq("machine_id", machineId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  let totalQty = 0;
  const lines = data.map((r) => {
    totalQty += r.quantity;
    return `${new Date(r.created_at).toLocaleDateString()} – ${r.movement_type} – Cant: ${r.quantity}`;
  });

  const header = `Reporte máquina ${machineId}\nMovimientos totales: ${data.length}\nCantidad total: ${totalQty}\n\n`;
  return header + lines.join("\n");
}

/**
 * Función interna para agrupar conteos entre dos fechas.
 */
async function _reportByDateRange(groupByField, from, to) {
  // 1) Traemos los registros sin agrupación
  const { data, error } = await supabase
    .from("inventory_movements")
    .select(`${groupByField}, quantity`)
    .gte("created_at", from)
    .lte("created_at", to);

  if (error) throw error;

  // 2) Agrupamos en JS
  const agg = data.reduce((acc, row) => {
    const key = row[groupByField];
    if (!acc[key]) acc[key] = { [groupByField]: key, count: 0, totalQuantity: 0 };
    acc[key].count += 1;                 // número de movimientos
    acc[key].totalQuantity += row.quantity; // suma de cantidad
    return acc;
  }, {});

  // 3) Convertimos el objeto en un array
  return Object.values(agg);
}

export async function fetchUsersList() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, apellido")
    .order("nombre", { ascending: true });
  if (error) throw error;
  // Combina nombre y apellido en un campo `name`
  return data.map((u) => ({
    id: u.id,
    name: `${u.nombre} ${u.apellido}`,
  }));
}

// src/services/reportService.js

/**
 * Inserta un nuevo reporte de colaborador.
 */
export async function insertUserReport({ machine_id, user_id, report_date, description }) {
  const { data, error } = await supabase
    .from("machine_reports")
    .insert([
      { machine_id, user_id, report_date, description }
    ])
    .select();  // <- Necesario para que 'data' contenga el registro insertado

  if (error) throw error;
  return data[0];
}


/**
 * Recupera todos los reportes hechos por un usuario, más detalles de máquina.
 */
export async function fetchUserReports(user_id) {
  const { data, error } = await supabase
    .from("machine_reports")
    .select("id, report_date, description, machines(name), created_at")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchAllUserReports() {
  const { data, error } = await supabase
    .from("machine_reports")
    .select(`
      id,
      report_date,
      description,
      created_at,
      machines (
        name
      ),
      profiles:profiles!machine_reports_user_id_fkey (
        nombre,
        apellido
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function insertEmployeeReport({
  user_id,
  dateFrom,
  dateTo,
  description,
}) {
  const { data, error } = await supabase
    .from("employee_reports")
    .insert([
      {
        user_id,
        date_from: dateFrom,
        date_to: dateTo,
        description,
      },
    ])
    .select(); // Para que devuelva el objeto insertado
  if (error) throw error;
  return data[0];
}

// --------------------------------------------
// 2.2. Función para traer todos los reportes de Empleados
// --------------------------------------------
export async function fetchEmployeeReports() {
  // Incluye nombre del usuario a través de perfiles
  const { data, error } = await supabase
    .from("employee_reports")
    .select(`
      id,
      date_from,
      date_to,
      description,
      generated_at,
      profiles:profiles!employee_reports_user_id_fkey (
        nombre,
        apellido
      )
    `)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return data;
}

// --------------------------------------------
// 2.3. Función para guardar reporte Valor Anual
// --------------------------------------------
export async function insertAnnualValueReport({
  year,
  totalValue,
  description,
}) {
  const { data, error } = await supabase
    .from("annual_value_reports")
    .insert([
      {
        year,
        total_value: totalValue,
        description,
      },
    ])
    .select();
  if (error) throw error;
  return data[0];
}

// --------------------------------------------
// 2.4. Función para traer todos los reportes Valor Anual
// --------------------------------------------
export async function fetchAnnualValueReports() {
  const { data, error } = await supabase
    .from("annual_value_reports")
    .select(`
      id,
      year,
      total_value,
      description,
      generated_at
    `)
    .order("year", { ascending: false });
  if (error) throw error;
  return data;
}