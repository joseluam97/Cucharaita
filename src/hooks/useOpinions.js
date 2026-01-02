// hooks/useOpinions.js
import { useState } from 'react';
import { supabase } from "../../supabase";

const useOpinions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * @param {string} orderName - El código del pedido (ej: NAZARET03)
     * @param {object} ratings - Objeto con { "Producto": nota }
     */
    const submitRatings = async (orderName, ratings) => {
        setLoading(true);
        setError(null);

        // 1. Transformar el objeto de ratings al formato de la tabla
        const dataToInsert = Object.entries(ratings).map(([productName, score]) => ({
            name: orderName,
            product: productName,
            score: Number(score)
        }));

        try {
            // 2. Insertar los puntajes en la tabla Opinions
            const { error: insertError } = await supabase
                .from('Opinions')
                .insert(dataToInsert);

            if (insertError) throw insertError;

            // 3. Opcional: Marcar el pedido como completado en tu tabla de pedidos
            // Asumiendo que tu tabla de validación se llama 'OrdersValidation'
            const { error: updateError } = await supabase
                .from('Request_Opinions')
                .update({ complete: true })
                .eq('name_code', orderName);

            if (updateError) throw updateError;

            // Crear codigo de descuento para el usuario
            const details_discount = {
                name: `OP-${orderName}`,
                active: true,
                import: 10,
                type: "PERCENTAGE",
                min_amount: 20,
            }

            const { error: insertDiscontsError } = await supabase
                .from('Discounts')
                .insert(details_discount);

            if (insertDiscontsError) throw insertDiscontsError;

            return { success: true };
        } catch (err) {
            console.error("Error en useOpinions:", err.message);
            setError(err.message);
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { submitRatings, loading, error };
};

export default useOpinions;