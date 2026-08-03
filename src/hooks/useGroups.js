// hooks/useGroups.js
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export const getProductGroupByProduct = async (id_product) => {
  const { data, error } = await supabase
    .from('Product_Group')
    .select(`
      *,
      group (id, name)
    `)
    .eq('product', id_product)
    .order('id', { ascending: true });

  if (error) throw error;

  return data;
};

export const getProductGroupByGroup = async (id_group) => {
  const { data, error } = await supabase
    .from('Product_Group')
    .select(`
      *,
      product (id, name)
    `)
    .eq('group', id_group)
    .order('id', { ascending: true });

  if (error) throw error;

  return data;
};

export const getAllGroups = async () => {
  const { data, error } = await supabase
    .from('Groups')
    .select(`
      *
    `)
    .order('id', { ascending: true });

  if (error) throw error;

  return data;
};

export const createGroup = async (group_data) => {
  const { data, error } = await supabase
    .from('Groups')
    .insert(group_data)
    .select(`*`)
    .single();

  if (error) throw error;

  return data;
};

export const updateGroupName = async (id, name_group) => {
    const { data, error } = await supabase
        .from('Groups')
        .update({name: name_group})
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const getGroupById = async (idGroup) => {
  const { data, error } = await supabase
    .from('Groups')
    .select(`
      *
    `)
    .eq('id', idGroup)
    .single();

  if (error) throw error;

  return data;
};

export const addGroupToProduct = async (groupData) => {
  const { data, error } = await supabase
    .from('Product_Group')
    .insert(groupData)
    .select(`*`)
    .single();

  if (error) throw error;

  return data;
};

export const editGroupToProduct = async (id, groupData) => {
    const { data, error } = await supabase
        .from('Product_Group')
        .update(groupData)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const deleteGroupToProduct = async (id_relation) => {
  const { data, error } = await supabase
    .from('Product_Group')
    .delete()
    .eq('id', id_relation);

  if (error) throw error;

  return data;
};

export const deleteGroup = async (id_group) => {
  const { data, error } = await supabase
    .from('Groups')
    .delete()
    .eq('id', id_group);

  if (error) throw error;

  return data;
};

const useGroups = ({ id_product = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getProductGroupByProduct(id_product);
        setData(result);
        setError(null);
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

export default useGroups;