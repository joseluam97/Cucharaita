// hooks/useUser.js
import { useState } from "react";
import { supabase } from "../../supabase";

const useUser = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // ⚠️ NOTA: Deberías usar hashing (bcrypt)
        .single();

      if (error) throw error;
      setData(data);
      localStorage.setItem('admin_session', JSON.stringify(data)); // Persistencia simple
      return data;
    } catch (e) {
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { data, login, loading, error };
};
export default useUser;