// Nuevo archivo: src/utils/fetchDiscount.js (o donde lo guardes)
import { supabase } from "../../supabase";

// Se convierte en una función ASÍNCRONA normal.
const fetchDiscount = async (code_selected) => {
    if (!code_selected) {
        return { data: null, error: null };
    }
    
    try {
        const { data, error } = await supabase
            .from('Discounts')
            .select('*')
            .eq('name', code_selected)
            .order('id', { ascending: false });

        if (error) {
            throw error;
        }

        // Devolvemos el array de datos y el error (si lo hay)
        return { data, error: null };
    } catch (error) {
        // Devolvemos el error si la consulta falla o hay un error de conexión
        return { data: null, error };
    }
};

export default fetchDiscount;