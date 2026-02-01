 // hooks/useLogAccess.js
import { useState } from "react";
import { supabase } from "../../supabase";

const useLogAccess = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para insertar el registro
  const insertAccess = async (accessData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('Accesos') // Nombre exacto de tu tabla en Supabase
        .insert([accessData]) // Supabase espera un array de objetos
        .select(); // Opcional: devuelve el dato insertado para confirmar

      if (error) throw error;

      return data;
    } catch (e) {
      console.error("Error insertando acceso en Supabase:", e.message);
      setError(e);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { insertAccess, loading, error };
};

export default useLogAccess;