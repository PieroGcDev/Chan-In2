import { supabase } from "../supabaseClient";
export const fetchMachines = async () => {
  const { data, error } = await supabase.from("machines").select(`
      id,
      name,
      code,
      assignee:machine_assignments ( profiles ( nombre, apellido) ),
      status
    `);
  if (error) throw error;
  return data;
};
