import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../supabase";

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(url);

        const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('id', { ascending: false });

        console.log("Datos obtenidos de Supabase:", data);
        console.log("Error obtenidos de Supabase:", error);

        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, setLoading, error };
};

export default useFetch;
