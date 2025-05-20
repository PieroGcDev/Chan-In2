import { supabase } from "../supabaseClient";

export const inviteUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const createProfileSafe = async ({
  id,
  nombre,
  apellido,
  telefono,
  role_id,
  email,           // <— ahora también recibimos email
}) => {
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();
  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

  const payload = { id, nombre, apellido, telefono, role_id, email };

  if (!existing) {
    // Insertar nuevo perfil con email
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([payload]);
    if (insertError) throw insertError;
  } else {
    // Actualizar existente incluyendo email
    const { error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);
    if (updateError) throw updateError;
  }
};

export const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      nombre,
      apellido,
      email,
      telefono,
      role:role_id ( name )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data
};
