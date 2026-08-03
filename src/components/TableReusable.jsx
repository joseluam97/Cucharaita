// src/components/TableReusable.jsx
import { BsEye, BsPencil, BsTrash } from "react-icons/bs";

const TableReusable = ({ columns, data, onView, onEdit, onDelete }) => {

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-light overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-brand-primary">
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} className="p-4 font-bold text-brand-white text-sm border-b border-brand-light whitespace-nowrap">
                                {col.header}
                            </th>
                        ))}
                        <th className="p-4 font-bold text-brand-white text-sm border-b border-brand-light text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-b border-brand-light/50 hover:bg-brand-cream/10 transition-colors">

                            {/* Renderizado dinámico de columnas */}
                            {columns.map((col, index) => (
                                <td key={index} className="p-4 text-sm text-gray-700">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}

                            {/* Acciones - Botones Modernos */}
                            <td className="p-4 text-sm">
                                <div className="flex items-center justify-end gap-2">
                                    {onView != undefined && (
                                        <button
                                            onClick={() => onView(row)}
                                            className="flex items-center justify-center w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                                            title="Consultar"
                                        >
                                            <BsEye size={18} />
                                        </button>
                                    )}

                                    {onEdit != undefined && (
                                        <button
                                            onClick={() => onEdit(row)}
                                            className="flex items-center justify-center w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                                            title="Editar"
                                        >
                                            <BsPencil size={16} />
                                        </button>
                                    )}

                                    {onDelete != undefined && (
                                        row.active || row.active == undefined ? (
                                        <button
                                            onClick={() => onDelete(row)}
                                            className="flex items-center justify-center w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                                            title="Eliminar"
                                        >
                                            <BsTrash size={16} />
                                        </button>
                                    ) : (
                                        <span className="px-3 py-1.5 flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-[10px] rounded-lg uppercase tracking-wider cursor-not-allowed">
                                            Borrado
                                        </span>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    ))}

                    {/* Estado vacío */}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} className="p-8 text-center text-gray-500 font-bold">
                                No hay registros disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TableReusable;