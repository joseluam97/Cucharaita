// hooks/useTags.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export const getAllTags = async () => {
    const { data, error } = await supabase
        .from('Tags')
        .select(`
            *,
            Productos ( id, name )
        `)
        .order('id', { ascending: true });

    if (error) throw error;
    return data;
};

export const createTag = async (tagData) => {
    const { data, error } = await supabase
        .from('Tags')
        .insert(tagData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateTag = async (id, tagData) => {
    const { data, error } = await supabase
        .from('Tags')
        .update(tagData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const deleteTag = async (id) => {
    const { data, error } = await supabase
        .from('Tags')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return data;
};

const useTags = ({} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('Tags')
          .select('*')
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

    fetchData();
  }, []);

  return { data, loading, setLoading, error };
};

export default useTags;