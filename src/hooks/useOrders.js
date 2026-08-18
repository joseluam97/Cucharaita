import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

export const getAllOrders = async () => {
    // Obtenemos los pedidos y solo el ID de los productos para poder contarlos
    const { data, error } = await supabase
        .from('Orders')
        .select(`
            *,
            Orders_Product ( id )
        `)
        .order('id', { ascending: false });

    if (error) throw error;
    return data;
};

export const getOrderById = async (orderId) => {
    const { data, error } = await supabase
        .from('Orders')
        .select(`
            *,
            Orders_Product (
                *,
                Orders_Options (*)
            )
        `)
        .eq('id', orderId)
        .order('id', { foreignTable: 'Orders_Product', ascending: true })
        .single();

    if (error) throw error;

    return data;
};
export const updateOrderStatus = async (orderId, newStatus) => {
    const { data, error } = await supabase
        .from('Orders')
        .update({ order_status: newStatus })
        .eq('id', orderId)
        .select();

    if (error) throw error;
    return data;
};

export const updateOrderDetails = async (orderId, updatedFields) => {
    const { data, error } = await supabase
        .from('Orders')
        .update(updatedFields)
        .eq('id', orderId)
        .select();

    if (error) throw error;
    return data;
};

// Añadir al final de src/hooks/useOrders.js

export const createOrder = async (orderData) => {
    const { data, error } = await supabase
        .from('Orders')
        .insert(orderData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const createOrderProduct = async (productData) => {
    const { data, error } = await supabase
        .from('Orders_Product')
        .insert(productData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateOrderProduct = async (orderProductId, updatedFields) => {
    const { data, error } = await supabase
        .from('Orders_Product')
        .update(updatedFields)
        .eq('id', orderProductId)
        .select();

    if (error) throw error;
    return data;
};

export const createOrderOption = async (optionsDataArray) => {
    const { data, error } = await supabase
        .from('Orders_Options')
        .insert(optionsDataArray)
        .select();

    if (error) throw error;
    return data;
};

export const deleteProductFromOrder = async (id_relation) => {
  const { data, error } = await supabase
    .from('Orders_Product')
    .delete()
    .eq('id', id_relation);

  if (error) throw error;

  return data;
};

export const deleteOptionsProductByProduct = async (id_product) => {
  const { data, error } = await supabase
    .from('Orders_Options')
    .delete()
    .eq('product', id_product);

  if (error) throw error;

  return data;
};