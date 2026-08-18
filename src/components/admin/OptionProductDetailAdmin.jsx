// src/screens/OptionProductDetailAdmin.jsx
import { useParams, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import {
  BsArrowLeft,
  BsSave,
  BsCardList,
  BsUiRadiosGrid,
  BsTrash,
  BsPencil,
  BsBoxSeam,
} from "react-icons/bs";
import { getGroupById, createGroup, updateGroupName, getProductGroupByGroup } from '../../hooks/useGroups';
import { getGroupOptionsByGroup, getAllOptions, createGroupOption, deleteGroupOption, updateGroupOption } from '../../hooks/useOptions';

import { LabelTitle, InputField } from "./CommonField";

const OptionProductDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreationMode = location.pathname.includes("/nuevo");
  const isEditMode = location.pathname.includes("/edit");

  // Estados de datos
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [groupName, setGroupName] = useState("");

  const [listProductsIncludeGroup, setListProductsIncludeGroup] = useState([]);

  // Información del Grupo
  const [groupData, setGroupData] = useState({});

  // Lista de opciones asignadas (Relación Group_Option)
  const [assignedOptions, setAssignedOptions] = useState([]);

  // Lista de todas las opciones disponibles (Para el select)
  const [allOptions, setAllOptions] = useState([]);

  const [formOptionsGroupInEditMode, setFormOptionsGroupInEditMode] = useState(false);
  const [formOptionsGroupVisible, setFormOptionsGroupVisible] = useState(false);

  // Estado para el formulario de añadir nueva opción al grupo
  const [newOptionData, setNewOptionData] = useState({
    option_id: "",
    add_price: ""
  });

  // 1. CARGA INICIAL DE DATOS
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const groupInfo = await getGroupById(id);
        setGroupData(groupInfo);
        setGroupName(groupInfo.name);

        const groupOptionsData = await getGroupOptionsByGroup(id);
        setAssignedOptions(groupOptionsData);

        const optionsList = await getAllOptions();
        setAllOptions(optionsList);

        const listProducts = await getProductGroupByGroup(id);
        setListProductsIncludeGroup(listProducts);


      } catch (error) {
        console.error("Error cargando los datos del grupo:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && !isCreationMode) {
      fetchInitialData();
    }
    else {
      setLoading(false);
    }
  }, [id]);

  // 2. MANEJADORES DE ESTADO
  const handleGroupChange = (e) => {
    const { name, value } = e.target;
    setGroupName(value);
  };

  const handleNewOptionChange = (e) => {
    const { name, value } = e.target;
    setNewOptionData((prev) => ({ ...prev, [name]: value }));
  };

  // 3. ACCIONES DE BASE DE DATOS
  const saveGroupChanges = async () => {
    setIsSaving(true);
    try {

      if (isCreationMode) {
        // Crear nuevo grupo
        const newGroup = await createGroup({ name: groupName });
        alert("✅ Grupo creado correctamente.");
        navigate(`/administration/option-group/${newGroup.id}/edit`);
      }
      else {
        // Llamada a BD para actualizar el nombre del grupo
        let result = await updateGroupName(id, groupName);
        alert("✅ Cambios del grupo guardados correctamente.");

        // Update Data
        const groupInfo = await getGroupById(id);
        setGroupData(groupInfo);
      }
    } catch (error) {
      console.error("Error al guardar grupo:", error);
      alert("❌ Hubo un error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const addOptionToGroup = async () => {

    // If form is close, open the form
    if (formOptionsGroupVisible == false) {
      setFormOptionsGroupVisible(true);
      return;
    }

    //If edit mode is true, call function to edit option
    if (formOptionsGroupInEditMode == true) {
      editOptionToGroup();
      return;
    }

    if (!newOptionData.option_id) {
      alert("Por favor, selecciona una opción del listado.");
      return;
    }

    const alreadyAssigned = assignedOptions.some(
      (opt) => opt.option.toString() === newOptionData.option_id.toString()
    );

    if (alreadyAssigned) {
      alert("Esta opción ya está asignada al grupo.");
      return;
    }

    try {
      const dataToInsert = {
        group: id,
        option: newOptionData.option_id,
        add_price: newOptionData.add_price ? parseFloat(newOptionData.add_price) : 0,
      };

      // Llamada a BD para insertar en Group_Option
      const insertedRecord = await createGroupOption(dataToInsert);

      // Update data
      const groupOptionsData = await getGroupOptionsByGroup(id);
      setAssignedOptions(groupOptionsData);

      // Reset form
      setNewOptionData({ option_id: "", add_price: "" });
      setFormOptionsGroupVisible(false);
    } catch (error) {
      console.error("Error al añadir opción:", error);
    }
  };

  const editOptionToGroup = async () => {
    let price_option = newOptionData.add_price ? parseFloat(newOptionData.add_price) : 0;

    // Llamada a BD para insertar en Group_Option
    const insertedRecord = await updateGroupOption(newOptionData.option_id, price_option);

    // Update data
    const groupOptionsData = await getGroupOptionsByGroup(id);
    setAssignedOptions(groupOptionsData);

    // Reset form
    setNewOptionData({ option_id: "", add_price: "" });
    setFormOptionsGroupVisible(false);
    setFormOptionsGroupInEditMode(false);

  }

  const editOptionFromGroup = async (groupOption) => {
    // Enable form
    setFormOptionsGroupVisible(true);
    setFormOptionsGroupInEditMode(true);

    // Complete the data in form
    setNewOptionData({ option_id: groupOption.id, add_price: groupOption.add_price });

  }

  const removeOptionFromGroup = async (idGroupOption) => {
    if (window.confirm("¿Eliminar esta opción del grupo?")) {
      try {
        // Llamada a BD para eliminar registro en Group_Option
        await deleteGroupOption(idGroupOption);

        // Update data
        const groupOptionsData = await getGroupOptionsByGroup(id);
        setAssignedOptions(groupOptionsData);

      } catch (error) {
        console.error("Error eliminando opción:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
          <p className="text-brand-primary font-bold text-sm">Cargando detalles del grupo...</p>
        </div>
      </div>
    );
  }

  const openProductInAdminPanel = (id_product) => {
    window.open(`/administration/productos/${id_product}/edit`, '_blank');
  };

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* CABECERA FLOTANTE */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/administration/option-group")}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-colors border border-slate-200"
            title="Volver"
          >
            <BsArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 leading-none">
                {!isCreationMode ? groupData.name : "Creación de Grupo"}
              </h1>
              {!isCreationMode && (
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold border border-slate-200">
                  ID: {id}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          onClick={saveGroupChanges}
          disabled={isSaving}
        >
          <BsSave size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 border border-brand-light">

        {/* COLUMNA IZQUIERDA: INFORMACIÓN DEL GRUPO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BsCardList className="text-brand-primary" /> Detalles del Grupo
            </h3>

            <InputField
              label="Nombre del Grupo"
              name="name"
              value={groupName}
              onChange={handleGroupChange}
              placeholder="Ej: Sabor de cobertura"
            />
          </div>
        </div>

        {/* COLUMNA DERECHA: GESTIÓN DE OPCIONES (Group_Option) */}

        {!isCreationMode && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BsUiRadiosGrid className="text-brand-primary" /> Opciones del Grupo
            </h3>

            {/* Formulario rápido para asignar nueva opción */}
            {formOptionsGroupVisible && (
              <>
                <LabelTitle title="Asignar opción al grupo" />
                <div className="flex items-center justify-between w-full">
                  <select
                    name="option_id"
                    value={newOptionData.option_id}
                    onChange={handleNewOptionChange}
                    className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                    disabled={formOptionsGroupInEditMode}
                  >
                    <option value="" disabled></option>
                    {/* Mapeo del catálogo de opciones */}
                    {allOptions?.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
                <InputField
                  type="number"
                  name="add_price"
                  placeholder="Precio extra (€)"
                  value={newOptionData.add_price}
                  onChange={handleNewOptionChange}
                  step="1"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-sm text-slate-800 w-full"
                />
              </>
            )}
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={addOptionToGroup}
                className="flex-1 bg-brand-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formOptionsGroupVisible ? "Guardar" : "Añadir Nueva Opcion"}
              </button>
              {formOptionsGroupVisible && (
                <button
                  type="button"
                  onClick={() => { setFormOptionsGroupVisible(false) }}
                  className="flex-1 bg-brand-red text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
              )}
            </div>

            {/* Listado visual de opciones asignadas */}
            <div className="mt-4 flex flex-col gap-3">
              <LabelTitle title="Opciones Asignadas Actualmente" />

              {assignedOptions.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                  Aún no hay opciones asignadas a este grupo.
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {assignedOptions.map((groupOption, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center p-2 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      <span className="flex items-center">
                        {groupOption.option?.name}

                        {parseFloat(groupOption.add_price) > 0 && (
                          <span className="ml-1.5 text-[15px] text-green-700 font-bold bg-green-50 px-2 py-1 rounded">
                            +{groupOption.add_price}€
                          </span>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() => editOptionFromGroup(groupOption)}
                        className="border-none bg-transparent outline-none shadow-none cursor-pointer text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center p-1 rounded-md hover:bg-red-50"
                        title="Desvincular opción"
                      >
                        <BsPencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOptionFromGroup(groupOption.id)}
                        className="border-none bg-transparent outline-none shadow-none cursor-pointer text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center p-1 rounded-md hover:bg-red-50"
                        title="Desvincular opción"
                      >
                        <BsTrash size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SECCIÓN: PRODUCTOS VINCULADOS A ESTE GRUPO */}
        {!isCreationMode && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BsBoxSeam className="text-brand-primary" /> Productos vinculados
            </h3>

            <div className="mt-1 flex flex-col gap-3">
              {!listProductsIncludeGroup || listProductsIncludeGroup.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
                  Ningún producto utiliza este grupo actualmente.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {listProductsIncludeGroup.map((relation) => (
                    <div
                      key={relation.id}
                      className="flex flex-col gap-3 p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all"
                    >
                      {/* Cabecera de la tarjeta: Nombre y Botón para ir al producto */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">
                            {relation.product?.name}
                          </h4>
                        </div>
                        <button
                          onClick={() => { openProductInAdminPanel(relation.product?.id) }}
                          className="text-[10px] font-bold uppercase tracking-wide text-brand-primary hover:text-white hover:bg-brand-primary px-2 py-1 rounded-md transition-colors border border-brand-primary/20"
                        >
                          Ver
                        </button>
                      </div>

                      {/* Etiquetas (Badges) de configuración en el producto */}
                      <div className="flex flex-wrap gap-2 pt-0">
                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold border ${relation.is_required ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          ID: {relation.product?.id}
                        </span>

                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold border ${relation.is_required ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {relation.is_required ? 'Obligatorio' : 'Opcional'}
                        </span>

                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold border ${relation.is_multiple ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {relation.is_multiple ? 'Múltiple' : 'Única'}
                        </span>

                        {relation.option_select > 0 && (
                          <span className="text-[10px] px-2 py-1 rounded-md font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                            Máx: {relation.option_select}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

export default OptionProductDetailAdmin;