import { supabase } from "../supabaseClient";

export const fetchUsers = async () => {
  const { data, error } = await supabase.from("profiles").select(`
      id,
      nombre,
      apellido,
      telefono,
      role:role_id ( name )
    `);
  if (error) throw error;
  return data;
};

export const inviteUser = async ({ email, password }) => {
  const { user, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return user;
};

export const createCollaborator = async ({
  userId,
  nombre,
  apellido,
  telefono,
}) => {
  const { data, error } = await supabase
    .from("profiles")
    .insert([{ id: userId, nombre, apellido, telefono }]);
  if (error) throw error;
  return data;
};
