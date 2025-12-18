// useCartStore.js
import { create } from "zustand";

const areOptionsEqual = (optionsA, optionsB) => {
  if (!optionsA || !optionsB) return !optionsA && !optionsB;
  const keysA = Object.keys(optionsA);
  const keysB = Object.keys(optionsB);
  if (keysA.length !== keysB.length) return false;

  for (const groupId of keysA) {
    const groupOptionsA = optionsA[groupId];
    const groupOptionsB = optionsB[groupId];
    if (!groupOptionsB) return false;

    const isArrayA = Array.isArray(groupOptionsA);
    const isArrayB = Array.isArray(groupOptionsB);
    if (isArrayA !== isArrayB) return false;

    if (isArrayA) {
      if (groupOptionsA.length !== groupOptionsB.length) return false;
      // 🛑 CAMBIO IMPORTANTE: Para soportar elementos repetidos (2x Galleta), 
      // comparamos los IDs ordenados para asegurar igualdad exacta.
      const idsA = groupOptionsA.map(o => o.id).sort();
      const idsB = groupOptionsB.map(o => o.id).sort();
      if (!idsA.every((id, index) => id === idsB[index])) return false;
    } else {
      if (groupOptionsA?.id !== groupOptionsB?.id) return false;
    }
  }
  return true;
};

const useCartStore = create((set) => ({
  cart: [],

  addToCart: (product) =>
    set((state) => {
      const existingProduct = state.cart.find((item) => 
        item.id === product.id && areOptionsEqual(item.options, product.options)
      );

      if (existingProduct) {
        return {
          cart: state.cart.map((item) =>
            item.cartItemId === existingProduct.cartItemId
              ? { ...item, quantity: item.quantity + product.quantity }
              : item
          ),
        };
      }

      // 🛑 GENERAMOS UN ID ÚNICO PARA ESTA LÍNEA DEL CARRITO
      const cartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      return { cart: [...state.cart, { ...product, cartItemId }] };
    }),

  // 🛑 AHORA ELIMINAMOS POR EL ID ÚNICO DE LÍNEA
  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartItemId !== cartItemId)
    })),
    
  // OPCIONAL: Si quieres que el botón de basura reste de 1 en 1:
  decreaseQuantity: (cartItemId) =>
    set((state) => {
      const updatedCart = state.cart.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item
      );
      return { cart: updatedCart.filter((item) => item.quantity > 0) };
    }),
}));

export default useCartStore;