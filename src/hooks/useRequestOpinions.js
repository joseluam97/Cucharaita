import { supabase } from "../../supabase";

const fetchRequestOpinions = async (code_selected) => {
    if (!code_selected) {
        return { data: null, error: null };
    }

    try {
        const { data, error } = await supabase
            .from('Request_Opinions')
            .select('*')
            .eq('name_code', code_selected)
            .single();

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

export default fetchRequestOpinions;