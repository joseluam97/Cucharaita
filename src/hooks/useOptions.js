// hooks/useOptions.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const useOptions = ({ id_product = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('Options_Products')
          .select(`
            *,
            group (id, name, multiple, option_select)
          `)
          .eq('product', id_product)
          .order('id', { ascending: true });

        if (error) throw error;

        setData(data);
      } catch (e) {
        console.error("Error fetching types:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    if (id_product != -1) {
      fetchData();
    }
  }, [id_product]);

  return { data, loading, setLoading, error };
};

export default useOptions;