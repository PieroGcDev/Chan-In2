import { supabase } from "../supabaseClient";

export async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select(
      `
      id,
      nombre,
      apellido,
      telefono,
      role_id,
      fk_roles:role_id (
        id,
        name,
        description
      )
    `
    )
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}
