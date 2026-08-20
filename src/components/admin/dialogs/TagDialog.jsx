import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { LabelTitle, InputField } from "../CommonField";

// Paleta ampliada de colores vibrantes y útiles
const PREDEFINED_COLORS = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
    "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
    "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#94a3b8",
    "#64748b", "#475569", "#334155", "#1e293b", "#0f172a", "#000000"
];

const TagDialog = ({
    isOpen,
    onClose,
    onSave,
    formData,
    setFormData,
    isSaving,
    isEditing
}) => {

    // Controlador para el input manual de HEX
    const handleHexInputChange = (e) => {
        // 1. Obtenemos el valor y le quitamos cualquier '#' que el usuario haya pegado o escrito
        let val = e.target.value.replace(/#/g, '');

        // 2. Limitamos a 6 caracteres (máximo de un código HEX real)
        val = val.substring(0, 6);

        // 3. Guardamos en el estado concatenando el '#' obligatoriamente
        setFormData({ ...formData, color: `#${val}` });
    };

    return (
        <Dialog
            open={isOpen}
            onClose={() => !isSaving && onClose()}
            className="relative z-50"
        >
            {/* FONDO OSCURO */}
            <DialogBackdrop
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999998 }}
            />

            {/* CONTENEDOR CENTRADO */}
            <div
                className="fixed inset-0 flex items-center justify-center p-4"
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
            >
                {/* TARJETA DEL MODAL (Bordes forzados con style) */}
                <DialogPanel
                    className="w-full max-w-md bg-white flex flex-col shadow-2xl overflow-hidden"
                    style={{ borderRadius: '1.25rem', border: '1px solid #e2e8f0' }} // Forzamos redondeo extremo
                >

                    {/* CABECERA */}
                    <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white m-0">
                        <DialogTitle className="text-lg font-bold text-slate-800 flex items-center m-0 p-0">
                            {isEditing ? 'Editar Tag' : 'Crear Nuevo Tag'}
                        </DialogTitle>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors font-bold text-xl leading-none outline-none border-none m-0 p-0"
                            title="Cerrar"
                        >
                            ×
                        </button>
                    </div>

                    {/* CUERPO DEL MODAL */}
                    <div className="p-6 flex flex-col gap-6 bg-slate-50/50 m-0">

                        {/* INPUT: TÍTULO */}
                        <div className="flex flex-col gap-2">
                            <InputField
                                label="Titulo"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* SECCIÓN: COLOR */}
                        <div className="flex flex-col gap-3">
                            <LabelTitle title="Color" />

                            {/* Controles de Color (Selector nativo + Input de texto) */}
                            <div className="flex items-center gap-3">
                                {/* Selector nativo cuadriculado */}
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 flex-shrink-0 cursor-pointer shadow-sm">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        className="absolute inset-0 w-[200%] h-[200%] -top-2 -left-2 cursor-pointer p-0 border-0"
                                        title="Color personalizado"
                                    />
                                    <InputField
                                        label="Color"
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>

                                {/* Input manual de HEX */}
                                <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-sm h-12 w-full max-w-[150px]">
                                    <span className="bg-slate-100 text-slate-500 font-bold px-3 h-full flex items-center border-r border-slate-300">
                                        #
                                    </span>
                                    <input
                                        type="text"
                                        value={formData.color.replace('#', '')} // Mostramos el valor sin el '#'
                                        onChange={handleHexInputChange}
                                        className="p-3 w-full outline-none font-mono font-bold text-slate-700 m-0 border-0 uppercase"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>

                            {/* Paleta de colores predefinida */}
                            <div className="flex flex-wrap gap-2.5 p-4 bg-white border border-slate-200 rounded-xl shadow-sm mt-1 justify-center">
                                {PREDEFINED_COLORS.map((hexCode) => {
                                    const isSelected = formData.color.toLowerCase() === hexCode.toLowerCase();
                                    return (
                                        <button
                                            key={hexCode}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, color: hexCode })}
                                            className="transition-transform hover:scale-110 flex-shrink-0 m-0 p-0"
                                            style={{
                                                backgroundColor: hexCode,
                                                width: '28px',       // Tamaño fijo blindado
                                                height: '28px',      // Tamaño fijo blindado
                                                minWidth: '28px',    // Evita aplastamiento de flexbox
                                                minHeight: '28px',   // Evita aplastamiento de flexbox
                                                borderRadius: '50%', // Circular
                                                border: isSelected ? '2.5px solid #fff' : '1px solid rgba(0,0,0,0.1)',
                                                boxShadow: isSelected ? '0 0 0 2px #000' : 'none', // Doble anillo si está seleccionado
                                            }}
                                            title={hexCode}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                    {/* PIE DEL MODAL (Botones) */}
                    <div className="p-5 border-t border-slate-100 bg-white flex justify-end gap-3 items-center m-0">
                        <button
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm outline-none m-0"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isSaving || !formData.title.trim()}
                            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed outline-none border-none m-0"
                        >
                            {isSaving ? 'Guardando...' : 'Guardar Tag'}
                        </button>
                    </div>

                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default TagDialog;