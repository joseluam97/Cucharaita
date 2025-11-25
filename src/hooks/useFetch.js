import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../supabase";

const useFetch = (request_products) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(request_products)
        const { data, error } = await supabase
        .from('Productos')
        .select('*')
        .order('id', { ascending: false });

        setData(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request_products]);

  return { data, loading, setLoading, error };
};

export default useFetch;
