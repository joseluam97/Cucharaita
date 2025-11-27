// src/store/productCacheStore.js
import { create } from 'zustand';

const useProductCacheStore = create((set) => ({
    // Estado para almacenar la lista de productos en caché
    cachedProducts: null, 
    // Estado para saber si la caché ya fue llenada al menos una vez
    isCacheReady: false, 

    // Función para guardar los productos en la caché
    setCachedProducts: (products) => set({ 
        cachedProducts: products,
        isCacheReady: true,
    }),
}));

export default useProductCacheStore;