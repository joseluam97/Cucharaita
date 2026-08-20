// src/store/useAlertStore.js
import { create } from 'zustand';

const useAlertStore = create((set) => ({
  alerts: [],
  
  // Función principal para lanzar alertas
  addAlert: ({ title, subtitle = "", type = "info", duration = 4000, position = "top-center" }) => {
    const id = Date.now() + Math.random(); // ID único
    
    set((state) => ({
      alerts: [...state.alerts, { id, title, subtitle, type, duration, position }]
    }));

    return id;
  },

  // Función para cerrar una alerta específica manualmente o por tiempo
  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));

export default useAlertStore;