import { supabase } from "../supabaseClient";

// Listar todas las máquinas
export const fetchMachines = async () => {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Crear nueva máquina
export const createMachine = async (machine) => {
  const { data, error } = await supabase.from("machines").insert([machine]);
  if (error) throw error;
  return data;
};

// Eliminar máquina
export const deleteMachine = async (id) => {
  const { error } = await supabase.from("machines").delete().eq("id", id);
  if (error) throw error;
};

// Obtener máquina por ID
export const fetchMachineById = async (id) => {
  const { data, error } = await supabase.from("machines").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

// Actualizar información
export const updateMachine = async (id, machine) => {
  const { id: _, ...cleanMachine } = machine;
  const { data, error } = await supabase.from("machines").update(cleanMachine).eq("id", id);
  if (error) throw error;
  return data;
};

// Asignar producto a máquina
export const assignProductToMachine = async (machineId, productId, stock) => {
  const { data, error } = await supabase
    .from("machine_products")
    .insert([{ machine_id: machineId, product_id: productId, assigned_stock: stock }]);

  if (error) throw error;
  return data;
};

// Eliminar producto asignado
export const removeProductFromMachine = async (machineId, productId) => {
  const { data, error } = await supabase
    .from("machine_products")
    .delete()
    .eq("machine_id", machineId)
    .eq("product_id", productId);

  if (error) throw error;
  return data;
};

// Obtener productos asignados a una máquina
export const fetchAssignedProductsToMachine = async (machineId) => {
  const { data, error } = await supabase
    .from("machine_products")
    .select(`
      product_id,
      assigned_stock,
      product:products (
        id, name, sku, image_url, price, stock, barcode, expiration_date
      )
    `)
    .eq("machine_id", machineId);

  if (error) throw error;
  return data;
};
