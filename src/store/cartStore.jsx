// useCartStore.js

// Importa la función `create` de zustand para crear un store
import { create } from "zustand";

/**
 * Compara dos objetos de opciones seleccionadas para determinar si son idénticos.
 * La comparación se basa en los IDs de las opciones, ignorando el orden de los grupos
 * y el orden de las opciones dentro de los arrays (si es selección múltiple).
 * * @param {object} optionsA - Objeto de opciones seleccionadas del carrito (item.selectedOptions).
 * @param {object} optionsB - Objeto de opciones seleccionadas del nuevo producto (product.selectedOptions).
 * @returns {boolean} True si las opciones son las mismas.
 */
const areOptionsEqual = (optionsA, optionsB) => {
  // Si ambos son falsy (null/undefined), son iguales (no se seleccionó nada en ambos)
  if (!optionsA || !optionsB) {
    return !optionsA && !optionsB;
  }

  const keysA = Object.keys(optionsA);
  const keysB = Object.keys(optionsB);

  // Deben tener el mismo número de grupos
  if (keysA.length !== keysB.length) {
    return false;
  }

  // Iterar sobre los IDs de grupo
  for (const groupId of keysA) {
    const groupOptionsA = optionsA[groupId];
    const groupOptionsB = optionsB[groupId];

    // Si el grupo no existe en B (y existe en A), son diferentes
    if (!groupOptionsB) return false;

    const isArrayA = Array.isArray(groupOptionsA);
    const isArrayB = Array.isArray(groupOptionsB);

    // Los tipos deben ser iguales (ambos array o ambos objeto)
    if (isArrayA !== isArrayB) return false;

    if (isArrayA) {
      // Caso Array (Selección Múltiple): Comparar por conjunto de IDs
      if (groupOptionsA.length !== groupOptionsB.length) return false;

      const idsA = new Set(groupOptionsA.map(o => o.id));
      const idsB = groupOptionsB.map(o => o.id);

      // Verificar si todos los IDs de B están en A
      for (const id of idsB) {
        if (!idsA.has(id)) return false;
      }

    } else {
      // Caso Objeto (Selección Única): Comparar por ID de opción
      if (groupOptionsA?.id !== groupOptionsB?.id) return false;
    }
  }

  return true;
};

// Crea un store usando Zustand para gestionar el carrito de compras
const useCartStore = create((set) => ({
  // Estado inicial del carrito
  cart: [],

  // Función para añadir un producto al carrito
  addToCart: (product) =>
    set((state) => {
      // 🛑 1. Buscar si el producto ya existe en el carrito con las MISMAS opciones
      const existingProduct = state.cart.find((item) => (
        // Compara el ID base del producto
        item.id === product.id &&
        // 🛑 Compara las opciones seleccionadas utilizando la nueva función
        areOptionsEqual(item.options, product.options)
      ));

      console.log("Carrito actual:", state.cart);

      // 2. Si el producto ya existe en el carrito (mismo ID y mismas opciones), incrementa la cantidad
      if (existingProduct) {
        return {
          // Actualiza la cantidad del producto coincidente
          cart: state.cart.map(
            (item) =>
              // Identifica el producto por su ID y la igualdad de opciones
              (item.id === product.id && areOptionsEqual(item.options, product.options))
                ? { ...item, quantity: item.quantity + product.quantity } // Incrementa por la cantidad que viene en 'product'
                : item // Mantiene el resto de los productos igual
          ),
        };
      }

      // 3. Si el producto no está en el carrito (o tiene opciones diferentes), lo agregamos
      // Nota: Asumimos que 'product' ya tiene el campo 'options' y el precio final calculado.
      return { cart: [...state.cart, { ...product }] };
    }),

  // Función para eliminar un producto del carrito
  // 🛑 ADVERTENCIA: Esta función de eliminación debería usar una lógica más robusta
  // para identificar el item a eliminar (ej: un index o un ID único de línea), 
  // ya que el ID del producto base puede no ser único en el carrito.
  removeFromCart: (productId) =>
    set((state) => {
      // Decrementa la cantidad del primer ítem que coincida con ese productId (usando la lógica original)
      const updatedCart = state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      );
      // Elimina el producto si su cantidad llega a 0
      return { cart: updatedCart.filter((item) => item.quantity > 0) };
    }),
}));

// Exporta el hook
export default useCartStore;