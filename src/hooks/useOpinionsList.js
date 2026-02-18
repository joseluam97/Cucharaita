import { useState, useEffect } from "react";
import { supabase } from "../../supabase";

const useOpinionsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función auxiliar para limpiar el nombre (LIDIA06 -> Lidia)
  const formatClientName = (rawName) => {
    if (!rawName) return "Anónimo";
    // 1. Cortar por guion bajo
    let name = rawName.split('_')[0];
    // 2. Quitar números
    name = name.replace(/[0-9]/g, '');
    // 3. Capitalizar (primera mayúscula)
    if (name.length > 0) {
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    }
    return rawName; // Fallback por si acaso
  };

  useEffect(() => {
    const fetchOpinions = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('Opinions')
          .select('*');
        // Nota: Quitamos el order de Supabase o lo dejamos como secundario,
        // porque el orden principal lo haremos por promedio abajo.

        if (fetchError) throw fetchError;

        if (!data) {
          setReviews([]);
          return;
        }

        // 1. Agrupar por cliente
        const groupedData = data.reduce((acc, curr) => {
          const rawName = curr.name || "Anónimo";

          if (!acc[rawName]) {
            acc[rawName] = {
              id: rawName,
              clientName: formatClientName(rawName),
              fullId: rawName,
              // Mantenemos la fecha para mostrarla, aunque ordenemos por nota
              date: new Date(curr.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
              products: [],
              totalScore: 0,
              count: 0
            };
          }

          acc[rawName].products.push({
            name: curr.product,
            score: Number(curr.score)
          });

          acc[rawName].totalScore += Number(curr.score);
          acc[rawName].count += 1;

          return acc;
        }, {});

        // 2. Calcular promedios
        let processedReviews = Object.values(groupedData).map(review => ({
          ...review,
          average: (review.totalScore / review.count).toFixed(1)
        }));

        // 3. ORDENAR: De mayor a menor promedio (Descendente)
        processedReviews.sort((a, b) => {
          return Number(b.average) - Number(a.average);
        });

        setReviews(processedReviews);

      } catch (err) {
        console.error("Error en useOpinionsList:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpinions();
  }, []);

  return { reviews, loading, error };
};

export default useOpinionsList;