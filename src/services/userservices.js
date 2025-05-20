// src/services/userservices.js

import { supabase } from "../supabaseClient";

/**
 * Crea una cuenta en Auth con email y password, devuelve el usuario creado.
 */
export const inviteUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
};

/**
 * Inserta o actualiza un perfil en la tabla profiles.
 * Siempre recibe id, nombre, apellido, telefono, role_id y email.
 */
export const createProfileSafe = async ({
  id,
  nombre,
  apellido,
  telefono,
  role_id,
  email,
}) => {
  // 1) Comprueba si ya existe un perfil con ese id
  const { data: existing, error: fetchError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  // Si hay un error distinto de "no encontrado", lo lanza
  if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

  const payload = { id, nombre, apellido, telefono, role_id, email };

  if (!existing) {
    // 2a) Inserta nuevo perfil
    const { error: insertError } = await supabase
      .from("profiles")
      .insert([payload]);
    if (insertError) throw insertError;
  } else {
    // 2b) Actualiza perfil existente
    const { error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", id);
    if (updateError) throw updateError;
  }
};

/**
 * Recupera todos los perfiles junto con el nombre de su rol.
 */
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
  return data;
};

/**
 * Actualiza un perfil existente (sin tocar la autenticación).
 */
export const updateProfileSafe = async ({
  id,
  nombre,
  apellido,
  telefono,
  role_id,
  email,
}) => {
  const { error } = await supabase
    .from("profiles")
    .update({ nombre, apellido, telefono, role_id, email })
    .eq("id", id);
  if (error) throw error;
};

/**
 * Elimina un perfil de la tabla profiles.
 * Nota: esto no elimina la cuenta de Auth.
 */
export const deleteProfile = async (id) => {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id);
  if (error) throw error;
};
