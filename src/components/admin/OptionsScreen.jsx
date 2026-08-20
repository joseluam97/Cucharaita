// src/screens/OptionsScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableReusable from '../TableReusable';
import { getAllOptions, getGroupOptionsByOption, addOption, updateOption, deleteOption } from '../../hooks/useOptions';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { LabelTitle, InputField } from "./CommonField";
import { fetchAllAdminProducts } from '../../hooks/useProducts';

const OptionsScreen = () => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para el Modal de Edición
  const [isCreationOption, setIsCreationOption] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [newName, setNewName] = useState("");
  const [productOption, setProductOption] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadOptions();
    loadProducts();
  }, []);

  useEffect(() => {
    if (isCreationOption == true) {
      setNewName("");
      setProductOption(null);
    }
  }, [isModalOpen]);

  // 1. Carga de datos
  const loadOptions = async () => {
    setLoading(true);
    try {
      let data = await getAllOptions();
      addGroupsToOptions(data);
    } catch (error) {
      console.error("Error al cargar opciones:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchAllAdminProducts();
      setProducts(data || []);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResumeOptionsByListOption = (listOptionGroup) => {
    return listOptionGroup.map(optionGroup => {
      const priceText = optionGroup.add_price > 0 ? ` (+${optionGroup.add_price}€)` : "";
      return {
        id: optionGroup.group.id,
        name: optionGroup.group.name + priceText
      }
    });
  }

  const addGroupsToOptions = async (listOptions) => {
    let listGroupAllInformation = [];
    for (const option of listOptions) {
      let listOptionGroupByOption = await getGroupOptionsByOption(option.id);
      let list_groups = getResumeOptionsByListOption(listOptionGroupByOption)
      listGroupAllInformation.push({
        id: option.id,
        name: option.name,
        associated_product: option.associated_product,
        numGroup: listOptionGroupByOption.length,
        options_list: list_groups
      })
    }
    setOptions(listGroupAllInformation);
  }

  const onChangeAssociatedProduct = (optionRow) => {

  }


  // 2. Configuración de columnas
  const groupsColumns = [
    {
      header: 'ID',
      render: (row) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-brand-dark whitespace-nowrap">
            {row.id}
          </span>
        </div>
      )
    },
    {
      header: 'Nombre',
      render: (row) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-brand-dark whitespace-nowrap">
            {row.name}
          </span>
        </div>
      )
    },
    {
      header: 'Grupos Asociados',
      render: (row) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-brand-dark whitespace-nowrap">
            {row.numGroup}
          </span>
        </div>
      )
    },
    {
      header: 'Resumen de Grupos',
      render: (row) => (
        <div className="flex items-center flex-wrap gap-1.5 max-w-xs">
          {row.options_list.length > 0 ? (
            row.options_list.map((optionText, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-600 rounded-md cursor-pointer"
                onClick={() => {
                  window.open(`/administration/option-group/${optionText.id}/edit/`, '_blank');
                }}
              >
                {optionText.name}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Sin grupos</span>
          )}
        </div>
      )
    },
    {
      header: 'Producto asociado para stock',
      render: (row) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-brand-dark whitespace-nowrap">
            {row.associated_product != null ?
              <span
                className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 text-[12px] font-bold text-slate-600 rounded-md cursor-pointer"
                onClick={() => {
                  window.open(`/administration/productos/${row.associated_product.id}`, '_blank');
                }}
              >
                {row.associated_product.name}
              </span>
              :
              "Sin producto asociado"
            }
          </span>
        </div>
      )
    }
  ];

  // 3. Manejadores de Edición
  const handleEdit = (optionRow) => {
    setEditingOption(optionRow);
    setNewName(optionRow.name);
    setProductOption(optionRow.associated_product ? optionRow.associated_product.id : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (optionRow) => {

    if (optionRow.options_list.length > 0) {
      addAlert({
        title: "No es posible realizar esta accion",
        subtitle: "No se puede eliminar la opción porque tiene grupos asociados. Por favor, elimina primero los grupos asociados a esta opción.",
        type: "warning"
      });

      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar la opción "${optionRow.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteOption(optionRow.id);
        addAlert({
          title: "Opción eliminada correctamente.",
          type: "success"
        });
        loadOptions();
      } catch (error) {
        console.error("Error al eliminar la opción:", error);
        addAlert({
          title: "Error al eliminar la opcion",
          subtitle: "Ocurrió un error al tratar de eliminar la opcion. Por favor, inténtalo de nuevo.",
          type: "error"
        });
      }
    }

  };

  const handleSaveEdit = async () => {
    if (!newName.trim()) {
      addAlert({
        title: "El nombre no puede estar vacío.",
        type: "error"
      });
      return;
    }

    setIsSaving(true);

    try {
      if (isCreationOption == true) {
        await addOption({
          name: newName,
          add_price: 0,
          associated_product: productOption ? productOption : null
        });
        addAlert({
          title: "Opción creada correctamente.",
          type: "success"
        });
      }
      else {
        await updateOption(
          editingOption.id,
          {
            name: newName,
            associated_product: productOption ? productOption : null
          }
        );
        addAlert({
          title: "Opción actualizada correctamente.",
          type: "success"
        });
      }
      setIsModalOpen(false);
      setIsCreationOption(false);
      setEditingOption(null);
      setNewName("");
      loadOptions();
    } catch (error) {
      console.error("Error al actualizar la opción:", error);
      addAlert({
        title: "Error al actualizar la opcion",
        subtitle: "Ocurrió un error al tratar de actualizar la opcion. Por favor, inténtalo de nuevo.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }


  };

  const checkIfButtonActive = () => {

    if (isSaving || !newName.trim() || newName != editingOption?.name || productOption != editingOption?.associated_product?.id) {
      return false;
    }

    return true;
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-light p-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark mb-1">Inventario de Opciones</h1>
        </div>
        <button
          onClick={() => {
            setIsCreationOption(true);
            setIsModalOpen(true);
          }}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg hover:shadow-brand-primary/30 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nueva Opción
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-light flex justify-center items-center">
          <div className="text-brand-primary font-bold animate-pulse">Cargando catálogo...</div>
        </div>
      ) : (
        <TableReusable
          columns={groupsColumns}
          data={options}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* MODAL DE EDICIÓN CON HEADLESS UI (VERSIÓN BLINDADA) */}
      <Dialog
        open={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        className="relative z-50"
      >
        {/* FONDO OSCURO (Backdrop) - Forzado con inline-style */}
        <DialogBackdrop
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 999998 }}
        />

        {/* CONTENEDOR CENTRADO - Forzado con inline-style */}
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
        >

          {/* TARJETA DEL MODAL */}
          <DialogPanel className="w-full max-w-md rounded-2xl bg-white flex flex-col border border-slate-100 shadow-2xl overflow-hidden">

            {/* Cabecera del Modal */}
            <div className="p-4 flex justify-between items-center bg-white">
              <DialogTitle className="text-lg font-bold text-slate-800 flex items-center">
                {isCreationOption == true ? "Crear Opción" : "Editar Opción"}
                <span className="text-brand-primary text-xs bg-blue-50 border border-blue-100 px-2 py-1 rounded-md ml-3 font-bold">
                  {isCreationOption == false ? "ID: " + editingOption?.id : ""}
                </span>
              </DialogTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors font-bold text-xl leading-none outline-none border-none"
                title="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Cuerpo del Modal */}
            <div className="p-4 flex-col justify-between items-center bg-white">
              <div className="flex flex-col gap-12">
                <InputField
                  label="Nombre del Grupo"
                  name="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej: Sabor de cobertura"
                />

              </div>
            </div>

            <div className="p-4 flex-col justify-between items-center bg-white">
              <LabelTitle title="Producto Asociado a la Opción (stock)" />
              <div className="flex items-center justify-between">
                <select
                  value={productOption}
                  onChange={(e) => setProductOption(e.target.value)}
                  className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                >
                  <option key={0} value={null}></option>
                  {products?.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pie del Modal (Botones) */}
            <div className="p-4 bg-white flex justify-end gap-3 items-center">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsCreationOption(false);
                }}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm outline-none m-0"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={checkIfButtonActive()}
                className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed outline-none border-none m-0"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
};

export default OptionsScreen;