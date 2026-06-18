// hooks/useStateShop.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const useStateShop = ({}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('StateShop')
          .select(`*`)
          .single();

        if (error) throw error;

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

export default useStateShop;