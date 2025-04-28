import { supabase } from "../supabaseClient";

export const fetchRoles = async () => {
  const { data, error } = await supabase.from("roles").select("*");
  if (error) throw error;
  return data;
};
