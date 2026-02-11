// hooks/useBlockedDays.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const useBlockedDays = ({} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('Blocked_days')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error; // Manejo explícito de error de Supabase

        setData(data);
      } catch (e) {
        console.error("Error fetching types:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, setLoading, error };
};

export default useBlockedDays;