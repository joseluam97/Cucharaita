import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

/**
 * Custom Hook para obtener uno o varios productos.
 * @param {object} options - Opciones de la consulta.
 * @param {number} [options.id=null] - ID del producto a obtener (si es null, trae todos).
 */
const useProducts = ({ id = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Definimos el ID que usaremos en las dependencias del useEffect
    // para que la consulta se ejecute solo si el ID cambia (o si es nulo y se ejecuta una vez).
    const productId = id;

    // Si el ID es null, traemos todos los productos.
    // Si el ID es un número, traemos ese producto.

    const fetchData = async () => {
      setLoading(true); // Siempre empieza cargando
      setError(null);

      try {
        let query = supabase
          .from('Productos')
          .select(`
            *,
            type ( name ) // Traemos solo el nombre del tipo
          `);

        console.log("Fetching product(s) with ID:", productId);

        // 1. Aplicar filtro: Si se proporciona un ID, filtramos por él.
        if (productId) {
          query = query.eq('id', productId).single(); // .single() espera un solo objeto
        } else {
          // 2. Aplicar ordenamiento: Si traemos todos, aplicamos el orden.
          query = query
            .order('type', { ascending: true })
            .order('name', { ascending: false });
        }

        const { data: fetchedData, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        // Si se busca un producto único y no se encuentra (data es null), marcamos error o manejamos.
        // Supabase/PostgREST devuelve un error 406 si no encuentra con .single(), pero es bueno revisar.
        if (productId && !fetchedData) {
          setError({ message: 'Producto no encontrado' });
          setData(null);
        } else {
          setData(fetchedData);
        }

      } catch (e) {
        console.error("Error en useProducts:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // El hook se re-ejecuta solo si el 'id' cambia

  return { data, loading, setLoading, error };
};

export default useProducts;