import { useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../../supabase";

const useTypes = (request_types) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(request_types)
        const { data, error } = await supabase
          .from('Type')
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
  }, [request_types]);

  return { data, loading, setLoading, error };
};

export default useTypes;
