// src/hooks/useProducts.js (MODIFICADO)
import { useState, useEffect } from "react";
import { supabase } from "../../supabase";
import useProductCacheStore from "../store/productCacheStore"; // Importar el store de caché

export const getProductById = async (productId) => {
    const { data, error } = await supabase
        .from('Productos')
        .select(`
            *,
            tag ( id, title, color ),
            type ( id, name )
        `)
        .eq('id', productId)
        .single();

    if (error) throw error;
    return data;
};

export const fetchAllAdminProducts = async () => {
    const { data, error } = await supabase
        .from('Productos')
        .select(`
            *,
            tag ( id, title, color ),
            type ( id, name )
        `)
        .order('id', { ascending: false }); // Los más recientes primero

    if (error) throw error;
    return data;
};

export const logicalDeleteProduct = async (id) => {
    const { data, error } = await supabase
        .from('Productos')
        .update({ active: false })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const updateHasOptionsByProduct = async (id, is_has_option) => {
    const { data, error } = await supabase
        .from('Productos')
        .update({ has_options: is_has_option })
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

export const createProduct = async (productData) => {
    const { data, error } = await supabase
        .from('Productos')
        .insert(productData)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateProduct = async (id, updatedFields) => {
    const { data, error } = await supabase
        .from('Productos')
        .update(updatedFields)
        .eq('id', id)
        .select();

    if (error) throw error;
    return data;
};

/**
 * Custom Hook para obtener uno o varios productos, utilizando caché en Zustand para la lista completa.
 * @param {object} options - Opciones de la consulta.
 * @param {number} [options.id=null] - ID del producto a obtener (si es null, trae todos).
 */
const useProducts = ({ id = null }) => {
    // 🛑 Obtener funciones y estado del caché de Zustand
    const { cachedProducts, isCacheReady, setCachedProducts } = useProductCacheStore();

    // Estados locales
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const productId = id;
        
        // 1. Lógica de CACHÉ: Si no se busca por ID y la caché ya tiene datos, úsalos inmediatamente
        if (productId === null && isCacheReady && cachedProducts) {
            setData(cachedProducts);
            setLoading(false);
            setError(null);
            return; // 🛑 Salir del useEffect para evitar el fetch
        }

        const fetchData = async () => {
            // Solo establecemos loading si realmente vamos a hacer una consulta a la BBDD
            setLoading(true);
            setError(null);

            try {
                let query = supabase
                    .from('Productos')
                    .select(`
                        *,
                        tag ( id, title, color ),
                        type ( id, name ) 
                    `);

                // Aplicar filtro/ordenamiento
                if (productId) {
                    query = query.eq('id', productId).single();
                } else {
                    query = query
                        .order('type', { ascending: false })
                        .order('tag', { ascending: true })
                        .order('name', { ascending: true });
                }
                
                // 🛑 Filtrar por activo para la lista completa, si no se está buscando por ID
                if (productId === null) {
                    query = query.eq('active', true);
                }

                const { data: fetchedData, error: fetchError } = await query;

                if (fetchError) {
                    throw fetchError;
                }
                
                // Si se busca un producto único y no se encuentra o no está activo
                if (productId && (!fetchedData || fetchedData.active === false)) {
                    setError({ message: 'Producto no encontrado' });
                    setData(null);
                } else {
                    setData(fetchedData);
                    
                    // 2. 🛑 Guardar en CACHÉ: Si la consulta fue para la lista completa, guárdala.
                    if (productId === null) {
                        setCachedProducts(fetchedData);
                    }
                }

            } catch (e) {
                console.error("Error en useProducts:", e);
                setError(e);
                setData(null); // Limpiamos data en caso de error
            } finally {
                setLoading(false);
            }
        };

        // Si el ID es válido (no es la inicialización -1) O no estamos en modo caché, hacemos fetch
        if (id != -1) {
            fetchData();
        }
        
    }, [id, isCacheReady]); // 🛑 isCacheReady es fundamental para que el useProducts intente el fetch inicial

    return { data, loading, setLoading, error };
};

export default useProducts;