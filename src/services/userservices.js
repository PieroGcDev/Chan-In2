import { supabase } from "../supabaseClient";

export const inviteUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

export const createProfileSafe = async ({ id, nombre, apellido, telefono, email, role_id }) => {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (existing) {
    console.log("Perfil existe, actualizando...");
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ nombre, apellido, telefono, email, role_id })
      .eq('id', id);
    if (updateError) throw updateError;
  } else {
    console.log("Insertando nuevo perfil...");
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ id, nombre, apellido, telefono, email, role_id }]);
    if (insertError) throw insertError;
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
      role_id (
        name
      )
    `)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};
