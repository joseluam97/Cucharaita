// src/components/ImageModal.jsx
import React from 'react';

const ImageModal = ({ isOpen, imageUrl, altText = "Imagen ampliada", onClose }) => {
    // Si no está abierto o no hay URL de imagen, no renderizamos nada
    if (!isOpen || !imageUrl) return null;

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in cursor-pointer"
            onClick={onClose} // Cierra al hacer clic en el fondo oscuro
        >
            <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
                <img 
                    src={imageUrl} 
                    alt={altText} 
                    className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic en la foto misma
                />
                <button 
                    onClick={onClose}
                    className="absolute -top-4 -right-4 bg-white text-slate-800 w-8 h-8 rounded-full shadow-lg flex items-center justify-center font-bold text-lg hover:bg-red-500 hover:text-white transition-colors"
                    title="Cerrar"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default ImageModal;