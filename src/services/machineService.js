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

export const fetchMachineById = async (id) => {
  const { data, error } = await supabase.from("machines").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

export const updateMachine = async (id, machine) => {
  const { id: _, ...cleanMachine } = machine;
  const { data, error } = await supabase.from("machines").update(cleanMachine).eq("id", id);
  if (error) throw error;
  return data;
};

