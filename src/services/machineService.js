import { supabase } from "../supabaseClient";

// Listar todas las máquinas (ordenadas por fecha de creación descendente)
export const fetchMachines = async () => {
  const { data, error } = await supabase
    .from("machines")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

// Crear una nueva máquina
export const createMachine = async (machine) => {
  const { data, error } = await supabase.from("machines").insert([machine]);
  if (error) throw error;
  return data;
};

// Eliminar una máquina
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

// Actualizar información de una máquina
export const updateMachine = async (id, machine) => {
  const { id: _, ...cleanMachine } = machine;
  const { data, error } = await supabase.from("machines").update(cleanMachine).eq("id", id);
  if (error) throw error;
  return data;
};

// Asignar producto a una máquina
export const assignProductToMachine = async (machineId, productId) => {
  const { data, error } = await supabase
    .from("machine_products") // Tabla de relación entre máquinas y productos
    .insert([{ machine_id: machineId, product_id: productId }]);

  if (error) throw error;
  return data;
};

// Eliminar un producto asignado de una máquina
export const removeProductFromMachine = async (machineId, productId) => {
  const { data, error } = await supabase
    .from("machine_products") // Suponiendo que 'machine_products' es la tabla de relación
    .delete()
    .eq("machine_id", machineId)
    .eq("product_id", productId);

  if (error) throw error;
  return data;
};

// Obtener los productos asignados a una máquina
export const fetchAssignedProductsToMachine = async (machineId) => {
  const { data, error } = await supabase
    .from("machine_products") // Tabla que asocia productos y máquinas
    .select("product_id") // Solo obtenemos los IDs de los productos
    .eq("machine_id", machineId);

  if (error) throw error;

  // Recuperamos los detalles de los productos asignados
  const productIds = data.map(item => item.product_id);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);

  if (productError) throw productError;
  return products;
};
