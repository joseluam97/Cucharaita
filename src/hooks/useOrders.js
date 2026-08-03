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
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getOrderById = async (orderId) => {
    // Obtenemos el pedido con todos sus productos y las opciones de cada producto
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

export const createOrderOptionsBatch = async (optionsDataArray) => {
    const { data, error } = await supabase
        .from('Orders_Options')
        .insert(optionsDataArray)
        .select();

    if (error) throw error;
    return data;
};