// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { fetchProfile } from "../services/profileService";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // ← nuevo

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const userData = await fetchProfile(data.session.user.id);
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false); // ← terminamos
    };

    getUser();
  }, []);

  return { user, isAuthenticated, loading };
};