import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Guardará todo: id, email, role
  const [loading, setLoading] = useState(true); // Estado de carga

  useEffect(() => {
    // Verificar si hay datos del usuario en localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData)); // Establecer el usuario desde localStorage
    }
    setLoading(false); // Dejar de cargar una vez que se ha verificado
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Guardar en localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Eliminar de localStorage
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {!loading && children} {/* No renderizar los hijos hasta que no esté cargado el usuario */}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
