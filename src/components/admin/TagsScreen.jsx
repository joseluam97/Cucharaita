import { useState, useEffect } from 'react';
import TableReusable from '../TableReusable';
import TagDialog from './dialogs/TagDialog';
import { getAllTags, createTag, updateTag, deleteTag } from '../../hooks/useTags';
import useAlertStore from '../../store/useAlertStore';

const TagsScreen = () => {
  const { addAlert } = useAlertStore();
  
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Estado del Formulario
  const [formData, setFormData] = useState({
    title: "",
    color: "#3b82f6"
  });

  const loadTags = async () => {
    setLoading(true);
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      console.error("Error al cargar tags:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  // --- CONFIGURACIÓN DE COLUMNAS ---
  const columns = [
    {
      header: 'ID',
      render: (row) => (
        <span className="font-bold text-brand-dark whitespace-nowrap">#{row.id}</span>
      )
    },
    {
      header: 'Título',
      render: (row) => (
        <span className="font-bold text-slate-700">{row.title}</span>
      )
    },
    {
      header: 'Color',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded-full shadow-sm border border-black/10"
            style={{ backgroundColor: row.color || '#ccc' }}
          />
          <span className="text-xs font-mono text-slate-500 uppercase">{row.color}</span>
        </div>
      )
    },
    // NUEVA COLUMNA: PRODUCTOS ASOCIADOS
    {
      header: 'Productos Asociados',
      render: (row) => (
        // flex-wrap permite que las "píldoras" salten a la siguiente línea si no caben
        <div className="flex items-center flex-wrap gap-1.5 max-w-xs">
          {row.Productos.length > 0 ? (
            row.Productos.map((productAssociated, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-md cursor-pointer"
                onClick={() => {
                  window.open(`/administration/productos/${productAssociated.id}`, '_blank');
                }}
              >
                {productAssociated.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Sin productos asociados</span>
          )}
        </div>
      )
    }
  ];

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({ title: "", color: "#3b82f6" });
    setIsModalOpen(true);
  };

  const handleEdit = (tag) => {
    setEditingId(tag.id);
    setFormData({
      title: tag.title || "",
      color: tag.color || "#000000"
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (tag) => {
    // 1. Verificamos si tiene productos asociados
    const numProducts = tag.Productos ? tag.Productos.length : 0;

    if (numProducts > 0) {
      // Obtenemos los nombres de hasta 3 productos para mostrarlos en el aviso
      const productNames = tag.Productos.slice(0, 3).map(p => p.name).join(", ");
      const moreText = numProducts > 3 ? `... y ${numProducts - 3} más` : "";

      alert(`❌ PROTECCIÓN ACTIVADA\n\nNo se puede eliminar el tag "${tag.title}" porque está asignado a ${numProducts} producto(s).\n\nProductos afectados: ${productNames}${moreText}.\n\nPor favor, quita este tag de esos productos antes de eliminarlo.`);
      return; // Cortamos la ejecución aquí
    }

    // 2. Si no tiene productos, procedemos con el borrado normal
    if (window.confirm(`¿Estás seguro de eliminar el tag "${tag.title}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteTag(tag.id);
        alert("✅ Tag eliminado correctamente.");
        loadTags();
      } catch (error) {
        console.error("Error eliminando tag:", error);
        alert("❌ Hubo un error al eliminar el tag.");
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      addAlert({
        title: "Error",
        subtitle: "El título del tag es obligatorio.",
        type: "error"
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        await updateTag(editingId, formData);
        addAlert({
          title: "Tag actualizado",
          subtitle: "Los cambios se han guardado en la base de datos.",
          type: "success" // Opciones: success, error, warning, info
        });
      } else {
        await createTag(formData);
        addAlert({
          title: "Tag creado",
          subtitle: "Los cambios se han guardado en la base de datos.",
          type: "success" // Opciones: success, error, warning, info
        });
      }
      setIsModalOpen(false);
      loadTags();
    } catch (error) {
      console.error("Error guardando tag:", error);
      alert("❌ Hubo un error al guardar el tag.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-light">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark mb-1">Inventario de Tags</h1>
          <p className="text-xs text-slate-500">Gestiona las etiquetas visuales para los productos.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nuevo Tag
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-light flex justify-center items-center">
          <div className="text-brand-primary font-bold animate-pulse">Cargando tags...</div>
        </div>
      ) : (
        <TableReusable
          columns={columns}
          data={tags}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <TagDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        formData={formData}
        setFormData={setFormData}
        isSaving={isSaving}
        isEditing={!!editingId}
      />
    </div>
  );
};

export default TagsScreen;