// hooks/useOptions.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export const getAllOptions = async () => {
  const { data, error } = await supabase
    .from('Options')
    .select(`
      *,
      associated_product (id, name)
    `)
    .order('id', { ascending: true });

  if (error) throw error;

  return data;
};

export const getGroupOptionsByOption = async (id_option) => {
  const { data, error } = await supabase
    .from('Group_Option')
    .select(`
      *,
      group (id, name)
    `)
    .eq('option', id_option)
    .order('id', { ascending: true });

  if (error) throw error;
  
  return data;
};

export const getGroupOptionsByGroup = async (id_group) => {
  const { data, error } = await supabase
    .from('Group_Option')
    .select(`
      *,
      option (id, name, add_price)
    `)
    .eq('group', id_group)
    .order('id', { ascending: true });

  if (error) throw error;
  
  return data;
};

export const createGroupOption = async (groupOptionData) => {
    const { data, error } = await supabase
        .from('Group_Option')
        .insert(groupOptionData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateGroupOption = async (id, add_price) => {
    const { data, error } = await supabase
        .from('Group_Option')
        .update({add_price: add_price})
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const addOption = async (option_data) => {
  const { data, error } = await supabase
    .from('Options')
    .insert(option_data)
    .select(`*`)
    .single();

  if (error) throw error;

  return data;
};

export const updateOption = async (id, option_data) => {
    const { data, error } = await supabase
        .from('Options')
        .update(option_data)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const deleteOption = async (idOption) => {
  const { data, error } = await supabase
    .from('Options')
    .delete()
    .eq('id', idOption);

  if (error) throw error;

  return data;
};

export const deleteGroupOption = async (idGroupOption) => {
  const { data, error } = await supabase
    .from('Group_Option')
    .delete()
    .eq('id', idGroupOption);

  if (error) throw error;

  return data;
};

export const deleteGroupOptionByGroup = async (idGroup) => {
  const { data, error } = await supabase
    .from('Group_Option')
    .delete()
    .eq('group', idGroup);

  if (error) throw error;

  return data;
};

// 2. HOOK REACT: Consumidor de la función pura para componentes estándar
const useOptions = ({ id_group = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const result = await getGroupOptionsByGroup(id_group);
        setData(result);
        setError(null); // Limpiamos errores previos si la consulta tiene éxito
      } catch (e) {
        console.error("Error fetching options:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    // Validación más robusta antes de lanzar la petición
    if (id_group !== null && id_group !== -1) {
      loadData();
    } else {
      setLoading(false); // Si no hay un ID válido, cortamos la carga
    }
  }, [id_group]);

  return { data, loading, setLoading, error };
};

export default useOptions;