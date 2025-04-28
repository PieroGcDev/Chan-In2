import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { useUser } from "../contexts/UserContext"; // Agregado
import { supabase } from "../supabaseClient"; // Agregado

function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (signInError) {
        setError(signInError.message);
        return;
      }
  
      const userId = data.user.id;
  
      // Obtener role_id desde la tabla users
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role_id') // Solo seleccionamos el campo role_id
        .eq('id', userId) // Asegúrate de que estés usando el campo correcto
        .single();
  
      if (profileError) {
        setError(profileError.message);
        return;
      }
  
      const roleId = userProfile.role_id; // Aquí obtienes el role_id del usuario
  
      // Ahora hacer otra consulta para obtener el nombre del rol
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', roleId) // Usamos el role_id para obtener el nombre del rol
        .single();
  
      if (roleError) {
        setError(roleError.message);
        return;
      }
  
      const roleName = roleData.name; // Aquí obtienes el nombre del rol
  
      // Ahora que tienes el nombre del rol, lo puedes usar en el login
      login({
        id: userId,
        email: data.user.email,
        role: roleName, // Aquí usas el nombre del rol
      });
  
      navigate("/dashboard");
  
    } catch (err) {
      console.error(err);
      setError("Error de inicio de sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center login-bg">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          Bienvenido
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <label className="block mb-1 font-medium text-secondary">Email</label>
        <input
          type="email"
          className="w-full mb-4 p-2 rounded border border-gray-200 focus:border-primary focus:outline-none"
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block mb-1 font-medium text-secondary">
          Contraseña
        </label>
        <input
          type="password"
          className="w-full mb-6 p-2 rounded border border-gray-200 focus:border-primary focus:outline-none"
          placeholder="********"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2 rounded transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default Login;
