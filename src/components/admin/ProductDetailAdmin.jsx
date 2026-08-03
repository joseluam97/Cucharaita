// src/screens/ProductDetailAdmin.jsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect, useCallback } from "react";
import {
  BsArrowLeft,
  BsSave,
  BsImage,
  BsBoxSeam,
  BsTags,
  BsCardList,
  BsUiRadiosGrid,
  BsTrash,
} from "react-icons/bs";
import { FaEdit } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa";
import { Base64 } from 'js-base64';
import useProducts, { createProduct, updateProduct, updateHasOptionsByProduct, getProductById } from "../../hooks/useProducts";
import useGroups from "../../hooks/useGroups";
import { getGroupOptionsByGroup } from "../../hooks/useOptions";
import { getAllGroups } from "../../hooks/useGroups";
import ImageModal from "../../components/admin/ImagenModal";
import { addGroupToProduct } from "../../hooks/useGroups";
import { deleteGroupToProduct } from "../../hooks/useGroups";
import { getProductGroupByProduct } from "../../hooks/useGroups";
import { editGroupToProduct } from "../../hooks/useGroups";
import useTypes from "../../hooks/useTypes";
import useTags from "../../hooks/useTags";
import { LabelTitle, InputField } from "./CommonField";

const ProductDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCreationMode = location.pathname.includes("/nuevo");
  const isEditMode = location.pathname.includes("/edit");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  //const { data: product, loading, error } = useProducts({ id });
  const { data: listTypes } = useTypes({});
  const { data: listTags } = useTags({});

  // ESTADOS
  const [listProductGroups, setListProductGroups] = useState([]);

  const [listOptionsProduct, setListOptionsProduct] = useState([]);
  const [listAllGroups, setListAllGroups] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [visibleFormGroup, setVisibleFormGroup] = useState(false);

  // NUEVOS ESTADOS PARA EL FORMULARIO
  const [formGroupData, setFormGroupData] = useState({});
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [idGroupProduct, setIdGroupProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    //Get Product if create modo is false
    if (isCreationMode == false) {
      getDataProduct();
    }
    setLoading(false);

    setFormGroupData({
      group: "",
      is_multiple: false,
      is_required: false,
      option_select: 1,
    });
  }, []);

  useEffect(() => {

    if (isCreationMode == true && listTypes != null && listTags != null) {

      setFormData((prev) => ({
        ...prev,
        type: listTypes[0].id,
      }))
      /*setFormData((prev) => ({
        ...prev,
        tag: listTags[0].id,
      }))*/
    }

  }, [isCreationMode, listTypes, listTags]);

  const getDataProduct = async () => {
    // Get all groups when the product is loaded
    const productData = await getProductById(id);
    setProduct(productData);
  };

  useEffect(() => {
    if (product) {
      getAllProductGroup();

      // Set form data
      setFormData({
        name: product.name || "",
        price: product.price || "",
        offer_price: product.offer_price || "",
        description: product.description || "",
        ingredients: product.ingredients || "",
        allergens: product.allergens || "",
        active: product.active ?? true,
        available: product.available ?? true,
        image: product.image || "",
        type: product.type.id || "",
        tag: product.tag != null ? product.tag.id : "",
        stock: product.stock || "",
      });
    }
  }, [product]);

  useEffect(() => {
    if (listProductGroups != null && product) {
      loadGroupOptions();
      getGroupsAddedToProduct();
    }
  }, [listProductGroups, product]);

  const getAllProductGroup = async () => {
    // Get all groups when the product is loaded
    const productGroups = await getProductGroupByProduct(product.id);
    setListProductGroups(productGroups);

    if (productGroups.length == 0) {
      await updateHasOptionsByProduct(product.id, false);
    }
  };

  const getGroupsAddedToProduct = async () => {
    const listAllGroups = await getAllGroups();
    setListAllGroups(listAllGroups);
  };

  const loadGroupOptions = async () => {
    if (listProductGroups != null && product) {
      try {
        setListOptionsProduct([]);
        const groupPromises = listProductGroups.map(async (productGroup) => {
          const listGroupOption = await getGroupOptionsByGroup(
            productGroup.group.id,
          );
          let listOptions = [];
          listGroupOption.forEach((group_option) => {
            group_option.option.add_price = Number(group_option.add_price);
            listOptions.push(group_option.option);
          });

          return {
            id_relation: productGroup.id,
            ...productGroup.group,
            is_multiple: productGroup.is_multiple,
            is_required: productGroup.is_required,
            option_select: productGroup.option_select,
            options: listOptions || [],
          };
        });
        const all_options = await Promise.all(groupPromises);
        setListOptionsProduct(all_options);
      } catch (error) {
        console.error("Error al cargar las opciones:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooleanChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "true" }));
  };

  const editGroupFromProduct = (group) => {
    setEditMode(true);
    setIdGroupProduct(group.id_relation);

    setFormGroupData({
      group: group.id,
      is_multiple: group.is_multiple,
      is_required: group.is_required,
      option_select: group.option_select,
    });
    setVisibleFormGroup(true);

  };

  const deleteGroupFromProduct = async (groupId) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este grupo del producto?",
      )
    ) {
      try {
        await deleteGroupToProduct(groupId.id_relation);

        alert("✅ Grupo eliminado correctamente del producto.");
        await getAllProductGroup();

        // Actualizar el estado de productHasOption después de eliminar un grupo
        if (listOptionsProduct.length == 0) {
          await updateHasOptionsByProduct(product.id, false);
        }

      } catch (error) {
        console.error("Error al eliminar el grupo:", error);
        alert("❌ Hubo un error al eliminar el grupo del producto.");
      }

    }
  };

  const cancelAddGroupToProduct = () => {
    setVisibleFormGroup(false);
  };

  const addNewGroupToProduct = async () => {
    if (visibleFormGroup == false) {
      setVisibleFormGroup(true);
      return;
    }

    if (!formGroupData.group || formGroupData.is_multiple === undefined || formGroupData.is_required === undefined || formGroupData.option_select === undefined) {
      alert("Por favor, completa todos los campos del formulario antes de añadir el grupo.",);
      return;
    }

    const alreadyExists = listOptionsProduct.some((group) => group.id == formGroupData.group);
    if (alreadyExists && editMode == false) {
      alert("Este grupo ya está asignado a este producto.");
      return;
    }

    if (formGroupData.is_multiple === true && formGroupData.option_select <= 1) {
      alert("Si el grupo es múltiple, el número de opciones a seleccionar debe ser mayor que 1.");
      return;
    }

    const groupData = listAllGroups.find(
      (group) => group.id == formGroupData.group,
    );

    if (groupData) {
      try {
        const detailsGroupData = {
          product: product.id,
          group: groupData.id,
          is_multiple: formGroupData.is_multiple,
          is_required: formGroupData.is_required,
          option_select: Number(formGroupData.option_select),
        };

        if (editMode == false) {
          await addGroupToProduct(detailsGroupData);

          // Actualizar el estado de productHasOption después de añadir un grupo
          if (product.has_options == false) {
            await updateHasOptionsByProduct(product.id, true);
          }
        }
        else {
          await editGroupToProduct(idGroupProduct, detailsGroupData);
        }

      } catch (error) {
        console.error("Error al añadir el grupo:", error);
      }
    }

    await getAllProductGroup();
    await loadGroupOptions();
    setVisibleFormGroup(false);

    setEditMode(false);
    setIdGroupProduct(null);
  };

  const saveChangesProduct = async () => {
    setIsSaving(true);
    try {
      const dataToUpdate = {
        name: formData.name,
        description: formData.description,
        ingredients: formData.ingredients,
        allergens: formData.allergens,
        active: formData.active,
        available: formData.available,
        price: parseFloat(formData.price) || 0,
        offer_price: formData.offer_price
          ? parseFloat(formData.offer_price)
          : null,
        stock: formData.stock
          ? parseInt(formData.stock)
          : 0,
        image: formData.image,
        type: formData.type,
        tag: formData.tag != 0 ? formData.tag : null,
      };

      if (isCreationMode == false) {
        await updateProduct(product.id, dataToUpdate);
      }
      else {
        let dataToCreate = {
          ...dataToUpdate,
          active: true,
          available: true,
          has_options: false,
        }
        let data_product = await createProduct(dataToCreate);

        setProduct(data_product);

        navigate(`/administration/productos/${data_product.id}/edit`);

      }

      alert("✅ Cambios guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      alert("❌ Hubo un error al actualizar el producto.");
    } finally {
      setIsSaving(false);
    }
  };

  const viewProductInWeb = () => {
    const encodedId = Base64.encodeURI(product.id);
    window.open(`/product/${encodedId}`, '_blank');
  };

  const reditToEditMode = (product) => {
    navigate(`/administration/productos/${product.id}/edit`);
  };

  const multipleOnChange = (e) => {

    let new_value_is_multiple = e.target.value == "true";

    setFormGroupData((prev) => ({
      ...prev,
      is_multiple: new_value_is_multiple,
    }));

    if (new_value_is_multiple === false) {
      setFormGroupData((prev) => ({
        ...prev,
        option_select: 1,
      }));
    }

  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
          <p className="text-brand-primary font-bold text-sm">
            Cargando detalles del producto...
          </p>
        </div>
      </div>
    );
  }

  if (!product && isCreationMode == false) {
    return (
      <div className="bg-red-50 p-8 rounded-2xl border border-red-100 text-center max-w-md mx-auto mt-10">
        <h2 className="text-red-600 font-bold text-lg mb-2">
          Producto no encontrado
        </h2>
        <p className="text-sm text-red-400 mb-6">
          El ID de producto que buscas no existe o ha sido eliminado
          permanentemente.
        </p>
        <button
          onClick={() => navigate("/administration/productos")}
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all"
        >
          Volver al inventario
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/administration/productos")}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-colors border border-slate-200"
            title="Volver"
          >
            <BsArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 leading-none">
                {!isCreationMode ? product.name : "Producto en creación"}
              </h1>
              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold border border-slate-200">
                ID: {!isCreationMode ? product.id : "0"}
              </span>
              <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-md font-bold border border-slate-200">
                {listOptionsProduct.length == 0 ? "Sin Opciones" : "Con Opciones"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isEditMode || isCreationMode
                ? isEditMode ? "Modo de edición activado" : "Modo de creación de producto activado"
                : "Modo consulta (solo lectura)"}
            </p>
          </div>
        </div>

        {isCreationMode == false && (
          <button
            className="bg-brand-red text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            onClick={viewProductInWeb}
            disabled={isSaving}
          >
            <FaRegEye size={16} /> Ver Producto
          </button>
        )}

        {(!isEditMode && !isCreationMode) && (
          <button
            className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            onClick={reditToEditMode}
            disabled={isSaving}
          >
            <FaEdit size={16} /> Modo edicion
          </button>
        )}

        {(isEditMode || isCreationMode) && (
          <button
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            onClick={saveChangesProduct}
            disabled={isSaving}
          >
            <BsSave size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        )}
      </div>

      {/* Contenedor Principal */}
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-6 border border-brand-light">
        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-2">
          <div className="flex flex-col gap-0">
            {/* 1. QUITAMOS 'items-center' de aquí y ampliamos un poco el gap */}
            <div className="bg-white p-2 rounded-2xl shadow-sm flex flex-col gap-0">
              {/* Contenedor de la Imagen */}
              <div
                className="relative w-full max-w-[220px] mx-auto aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center group cursor-pointer shadow-sm"
                onClick={() => product.image && setIsImageModalOpen(true)}
                title="Ver imagen en grande"
              >
                {product?.image ? (
                  <>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <span className="bg-white/90 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-sm">
                        🔍 Ampliar
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-slate-400">
                    <BsImage size={32} className="mb-2 opacity-30" />
                    <span className="text-xs font-medium">Sin imagen</span>
                  </div>
                )}
              </div>

              {/* Input de la imagen (Ahora ocupará el 100%) */}
              {(isEditMode || isCreationMode) && (
                <div className="w-full p-3">
                  <InputField
                    label="Url de la imagen"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleInputChange}
                    disabled={!isEditMode && !isCreationMode}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col gap-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <BsBoxSeam className="text-brand-primary" /> Disponibilidad
              </h3>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-600">
                    Estado en Web
                  </span>
                  <select
                    name="active"
                    value={formData.active}
                    onChange={handleBooleanChange}
                    disabled={!isEditMode && !isCreationMode}
                    className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg disabled:opacity-60 cursor-pointer outline-none"
                  >
                    <option value={true}>🟢 Visible</option>
                    <option value={false}>🔴 Oculto</option>
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                  <span className="text-xs font-bold text-slate-600">
                    Stock Físico
                  </span>
                  <select
                    name="available"
                    value={formData.available}
                    onChange={handleBooleanChange}
                    disabled={!isEditMode && !isCreationMode}
                    className="bg-white border border-slate-200 text-xs font-bold p-1.5 rounded-lg disabled:opacity-60 cursor-pointer outline-none"
                  >
                    <option value={true}>✅ En Stock</option>
                    <option value={false}>❌ Agotado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <BsCardList className="text-brand-primary" /> Información Principal
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6 pe-5">
              <InputField
                label="Nombre del Producto"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                disabled={!isEditMode && !isCreationMode}
                span={2}
              />

              <InputField
                label="Precio Base (€)"
                name="price"
                type="number"
                value={formData.price || ""}
                onChange={handleInputChange}
                disabled={!isEditMode && !isCreationMode}
              />

              <LabelTitle title="Categoría" />
              <div className="flex items-center justify-between">
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                  disabled={!isEditMode && !isCreationMode}
                >
                  {listTypes?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>



            </div>
            <div className="flex flex-col gap-6">
              <InputField
                label="Stock (unidades)"
                name="stock"
                type="number"
                value={formData.stock || ""}
                onChange={handleInputChange}
                placeholder="0"
                disabled={!isEditMode && !isCreationMode}
              />

              <InputField
                label="Precio en Oferta (€)"
                name="offer_price"
                type="number"
                value={formData.offer_price || ""}
                onChange={handleInputChange}
                placeholder="0.00"
                disabled={!isEditMode && !isCreationMode}
              />

              <LabelTitle title="Tag" />
              <div className="flex items-center justify-between">
                <select
                  value={formData.tag}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tag: e.target.value,
                    }))
                  }
                  className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                  disabled={!isEditMode && !isCreationMode}
                >
                  <option key={0} value={0}></option>
                  {listTags?.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.title}
                    </option>
                  ))}
                </select>
              </div>



            </div>
          </div>

          <InputField
            label="Alérgenos Destacados"
            name="allergens"
            value={formData.allergens || ""}
            onChange={handleInputChange}
            disabled={!isEditMode && !isCreationMode}
            span={3}
            placeholder="Ej: Contiene trazas de soja, gluten..."
          />

          <div className="md:col-span-2 xl:col-span-3">
            <InputField
              label="Descripción Pública"
              name="description"
              type="textarea"
              value={formData.description || ""}
              onChange={handleInputChange}
              disabled={!isEditMode && !isCreationMode}
            />
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <InputField
              label="Ingredientes"
              name="ingredients"
              type="textarea"
              value={formData.ingredients || ""}
              onChange={handleInputChange}
              disabled={!isEditMode && !isCreationMode}
            />
          </div>
        </div>

        {isCreationMode == false && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <BsUiRadiosGrid className="text-brand-primary" /> Opciones de
              Personalización
            </h3>
            {isEditMode && (
              <div className="flex flex-col gap-2 mt-2">
                {visibleFormGroup && (
                  <>
                    <LabelTitle title="Grupos para añadir" />
                    <div className="flex items-center justify-between">
                      <select
                        value={formGroupData.group}
                        onChange={(e) =>
                          setFormGroupData((prev) => ({
                            ...prev,
                            group: e.target.value,
                          }))
                        }
                        className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                      >
                        <option value="" disabled>
                          Selecciona un grupo...
                        </option>
                        {listAllGroups?.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <LabelTitle title="Multiple" />
                    <div className="flex items-center justify-between">
                      <select
                        value={formGroupData.is_multiple}
                        onChange={multipleOnChange}
                        className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                      >
                        <option value={true}>Si</option>
                        <option value={false}>No</option>
                      </select>
                    </div>

                    <LabelTitle title="Obligatorio" />
                    <div className="flex items-center justify-between">
                      <select
                        value={formGroupData.is_required}
                        onChange={(e) =>
                          setFormGroupData((prev) => ({
                            ...prev,
                            is_required: e.target.value == "true",
                          }))
                        }
                        className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                      >
                        <option value={true}>Si</option>
                        <option value={false}>No</option>
                      </select>
                    </div>

                    <InputField
                      label="Numero de opciones a seleccionar"
                      name="option_select"
                      type="number"
                      value={formGroupData.option_select ?? ""}
                      onChange={(e) =>
                        setFormGroupData((prev) => ({
                          ...prev,
                          option_select: parseInt(e.target.value) || "",
                        }))
                      }
                      placeholder="0"
                      disabled={formGroupData.is_multiple === false}
                    />
                  </>
                )}
                <div className="flex gap-3 w-full">
                  <button
                    type="button"
                    onClick={addNewGroupToProduct}
                    className="flex-1 bg-brand-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {visibleFormGroup == true ? editMode == true ? "Editar Grupo" : "Crear Grupo" : "Añadir Grupo"}
                  </button>
                  {visibleFormGroup && (
                    <button
                      type="button"
                      onClick={cancelAddGroupToProduct}
                      className="flex-1 bg-red-100 text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            )}

            {listOptionsProduct.map((group) => (
              <div
                key={group.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col gap-1.5">
                    <h4 className="text-sm font-bold text-slate-700">
                      {group.name}
                    </h4>
                    <span className="ml-1.5 text-[15px] text-green-600 font-bold bg-green-50 px-1.5 rounded w-max">
                      <small className="opacity-80 fw-normal">
                        {" "}
                        Obligatorio: {group.is_required ? "Sí" : "No"}
                      </small>
                    </span>
                    <span className="ml-1.5 text-[15px] text-green-600 font-bold bg-green-50 px-1.5 rounded w-max">
                      <small className="opacity-80 fw-normal">
                        {" "}
                        Tipo de elección: {group.is_multiple == true ? " Múltiple (" + group.option_select + ")" : " Única"}
                      </small>
                    </span>
                  </div>
                  {isEditMode && (
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                        onClick={() => editGroupFromProduct(group)}
                      >
                        Editar opciones
                      </button>
                      <button
                        className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors border border-red-100"
                        onClick={() => deleteGroupFromProduct(group)}
                      >
                        Eliminar grupo
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {group.options.map((option, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center p-2 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-600 shadow-sm"
                    >
                      {option.name}
                      {option.add_price > 0 && (
                        <span className="ml-1.5 text-[11px] text-green-700 font-bold bg-green-50 px-1.5 py-0.5 rounded">
                          +{option.add_price}€
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ImageModal
        isOpen={isImageModalOpen}
        imageUrl={product?.image}
        altText={product?.name}
        onClose={() => setIsImageModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetailAdmin;
