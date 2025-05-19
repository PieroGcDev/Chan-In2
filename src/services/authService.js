import { supabase } from "../supabaseClient";
import validator from "validator";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 5;

const sanitizeInput = (input) => validator.escape(input.trim());

/**
 * Intenta iniciar sesión aplicando bloqueo por email si supera MAX_ATTEMPTS.
 */
export const signIn = async (email, password) => {
  // 1) Sanitizar
  email = sanitizeInput(email).toLowerCase();
  password = sanitizeInput(password);

  const now = new Date();

  // 2) Leer registro de bloqueos para este email
  const { data: record, error: recordError } = await supabase
    .from("failed_attempts")
    .select("attempts, locked_until")
    .eq("email", email)
    .single();

  if (recordError && recordError.code !== "PGRST116") {
    console.error("Error leyendo failed_attempts:", recordError.message);
    throw new Error("Error interno, por favor intenta más tarde.");
  }

  const attempts = record?.attempts || 0;
  const lockedUntil = record?.locked_until ? new Date(record.locked_until) : null;

  // 3) Verificar bloqueo vigente
  if (lockedUntil && lockedUntil > now) {
    const diffMs = lockedUntil - now;
    const min = Math.floor(diffMs / 60000);
    const sec = Math.floor((diffMs % 60000) / 1000);
    throw new Error(`Bloqueado. Intenta en ${min}:${sec.toString().padStart(2,"0")} minutos.`);
  }

  // 4) Intentar login
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    // registro de intento fallido
    const newAttempts = attempts + 1;
    const newLock =
      newAttempts >= MAX_ATTEMPTS
        ? new Date(now.getTime() + LOCKOUT_DURATION_MINUTES * 60000).toISOString()
        : null;

    const { error: upsertError } = await supabase
      .from("failed_attempts")
      .upsert(
        { email, attempts: newAttempts, locked_until: newLock },
        { onConflict: "email" }
      );

    if (upsertError) console.error("Error al registrar intento:", upsertError.message);

    throw new Error("Credenciales inválidas");
  }

  // 5) Login exitoso → limpiar registros de bloqueos
  const { error: deleteError } = await supabase
    .from("failed_attempts")
    .delete()
    .eq("email", email);

  if (deleteError) console.error("Error al borrar bloqueos:", deleteError.message);

  // 6) Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`
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
    `)
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Error al cargar perfil:", profileError.message);
    throw new Error("No se pudo obtener el perfil de usuario.");
  }

  // 7) Devolver datos de usuario
  return {
    id: authData.user.id,
    email: authData.user.email,
    nombre: profile.nombre,
    apellido: profile.apellido,
    telefono: profile.telefono,
    role: profile.fk_roles?.name || "guest",
  };
};

/**
 * Envía correo para restablecer contraseña.
 */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://chan-in2-pierogcdevs-projects.vercel.app/reset-password",
  });
  if (error) throw error;
};
