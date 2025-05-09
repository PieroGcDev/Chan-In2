import { supabase } from "../supabaseClient";
import validator from "validator";

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 15;

const sanitizeInput = (input) => validator.escape(input);

export const signIn = async (email, password) => {
  email = sanitizeInput(email);
  password = sanitizeInput(password);
  console.log("Iniciando sesión con email:", email);

  const now = new Date();

  // Verificar intentos fallidos
  const { data: attempts, error: attemptsError } = await supabase
    .from("failed_attempts")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false })
    .limit(MAX_ATTEMPTS);

  if (attemptsError) {
    console.error("Error al obtener intentos fallidos:", attemptsError.message);
    throw attemptsError;
  }

  const recentAttempts = attempts.filter(
    (a) =>
      (now - new Date(a.created_at)) / (1000 * 60) <= LOCKOUT_DURATION_MINUTES
  );

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    throw new Error("Demasiados intentos fallidos. Intenta nuevamente más tarde.");
  }

  // Intentar iniciar sesión
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Registrar intento fallido
    await supabase.from("failed_attempts").insert([{ email, created_at: now }]);
    throw new Error("Credenciales inválidas");
  }

  // Si login fue exitoso, eliminar intentos anteriores
  await supabase.from("failed_attempts").delete().eq("email", email);

  // Obtener perfil del usuario
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
    .eq("id", user.id)
    .single();

  if (profileError) throw profileError;

  // Construir objeto userData para login()
  return {
    id: user.id,
    email: user.email,
    nombre: profile.nombre,
    apellido: profile.apellido,
    telefono: profile.telefono,
    role: profile.fk_roles?.name || "guest"
  };
};

export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: "https://chan-in2-pierogcdevs-projects.vercel.app/reset-password",
  });
  if (error) throw error;
};

