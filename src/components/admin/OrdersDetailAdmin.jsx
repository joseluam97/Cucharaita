import { useParams, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { BsArrowLeft, BsSave, BsPerson, BsBoxSeam, BsListCheck, BsTrash, BsPencil } from "react-icons/bs";
import { IoMdAdd } from "react-icons/io";
import { FiMinus } from "react-icons/fi";
import { FaEdit } from "react-icons/fa";
import { getOrderById, updateOrderDetails, createOrderOption, deleteOptionsProductByProduct, createOrderProduct, updateOrderProduct, deleteProductFromOrder } from "../../hooks/useOrders";
import { InputField, LabelTitle } from "./CommonField";
import { fetchAllAdminProducts } from "../../hooks/useProducts";
import { getProductGroupByProduct } from "../../hooks/useGroups";
import { getGroupOptionsByGroup } from "../../hooks/useOptions";
import OptionsProductSelect from "../OptionsProductSelect";
import { getGroupById } from "../../hooks/useGroups";

const ORDER_STATUSES = [
  "CREADO", "REVISADO", "PENDIENTE DE RECIBIR PRIMER PAGO",
  "PEDIDO PAGADO", "EN PREPARACION", "ENVIADO", "FINALIZADO"
];

const OrdersDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isEditMode = location.pathname.includes("/edit");

  const [orderData, setOrderData] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [productDuplicated, setProductDuplicated] = useState(false);

  const [listProducts, setListProducts] = useState({});

  const [formProductGroupInEditMode, setFormProductGroupInEditMode] = useState(false);
  const [formProductChangeVisible, setFormProductChangeVisible] = useState(false);
  const [productData, setProductData] = useState({
    product_id: "",
    units_product: 1,
    product_data: undefined,
    list_options: {}
  });

  const [selectedGroupOptions, setSelectedGroupOptions] = useState({});
  const [canAddToCart, setCanAddToCart] = useState(false);
  const [precioWithAdd, setPrecioWithAdd] = useState(0);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const data = await getOrderById(id);
        setOrderData(data);

        // Poblamos el formulario
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          delivery_place: data.delivery_place || "",
          delivery_date: data.delivery_date || "",
          amount: data.amount || 0,
          amount_paid: data.amount_paid || 0,
          order_status: data.order_status || "CREADO",
        });

        const listProducts = await fetchAllAdminProducts(id);
        setListProducts(listProducts);

      } catch (error) {
        console.error("Error al cargar detalles del pedido:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      await updateOrderDetails(id, formData);
      addAlert({
        title: "Pedido actualizado correctamente.",
        type: "success"
      });
      // Actualizamos los datos locales para la vista
      setOrderData(prev => ({ ...prev, ...formData }));
      navigate(`/administration/orders/${id}`); // Volver a modo vista
    } catch (error) {
      console.error("Error guardando pedido:", error);
      addAlert({
        title: "Error al actualizar el pedido",
        subtitle: "Ocurrió un error al tratar de actualizar el pedido. Por favor, inténtalo de nuevo.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const addNewProduct = async () => {

    // If form is close, open the form
    if (formProductChangeVisible == false) {
      setFormProductChangeVisible(true);
      return;
    }

    const finalAddPriceOrder = Number(precioWithAdd * productData.units_product);

    const newProductOrder = await createOrderProduct({
      order: id,
      name: productData.product_data.name,
      price: finalAddPriceOrder,
      units: productData.units_product,
      product_link: productData.id
    });

    if (productData.list_options && productData.list_options.length > 0) {
      // Add the options to the product
      let idOrderProduct = newProductOrder.id;

      for (const [key, items] of Object.entries(selectedGroupOptions)) {

        const id_group = key;
        const group = items;
        const group_data = await getGroupById(id_group);
        const groupOptions = groupOptionsDuplicated(group);

        for (const optionGroup of groupOptions) {
          await createOrderOption({
            product: idOrderProduct,
            group: group_data.name,
            option: optionGroup.name,
            extra_price: optionGroup.add_price,
            units: optionGroup.units,
          });
        }
      }
    }

    // add price to ammount
    const newAmount = formData.amount + finalAddPriceOrder;
    setFormData((prev) => ({
      ...prev,
      amount: newAmount
    }));
    await updateOrderDetails(id, { amount: newAmount });

    // Reload the order data
    const updatedOrder = await getOrderById(id);
    setOrderData(updatedOrder);

    // Close form and reset
    setProductData({
      product_id: "",
      units_product: 1,
      product_data: undefined,
      list_options: {}
    });

    setCanAddToCart(false);
    setFormProductGroupInEditMode(false);
    setFormProductChangeVisible(false);
  }

  const groupOptionsDuplicated = (optionData) => {
    // 1. Control de seguridad por si llega nulo o indefinido
    if (!optionData) return [];

    // 2. Normalizamos los datos: si no es array, lo convertimos en un array de 1 elemento
    const dataArray = Array.isArray(optionData) ? optionData : [optionData];

    // 3. Aplicamos el reduce (ahora siempre funcionará porque dataArray siempre es un array)
    const groupedItems = dataArray.reduce((acc, current) => {
      if (acc[current.id]) {
        // Si ya existe, sumamos 1 a units
        acc[current.id].units += 1;
      } else {
        // Si no existe, lo inicializamos omitiendo tempId y añadiendo units: 1
        acc[current.id] = {
          id: current.id,
          name: current.name,
          add_price: current.add_price,
          units: 1
        };
      }
      return acc;
    }, {});

    return Object.values(groupedItems);
  }

  const deleteProductCart = async (orderProduct) => {

    // Delete order options by product
    await deleteOptionsProductByProduct(orderProduct.id);

    // reduce price to ammount
    const newAmount = formData.amount - orderProduct.price * orderProduct.units;
    setFormData((prev) => ({
      ...prev,
      amount: newAmount
    }));
    await updateOrderDetails(id, { amount: newAmount });

    // Lógica para eliminar un producto del pedido
    const productToDelete = await deleteProductFromOrder(orderProduct.id);

    // Reload the order data
    const updatedOrder = await getOrderById(id);
    setOrderData(updatedOrder);

  }

  const changeUnitsProducts = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const changeProductOption = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));

    // Get the selected product from listProducts based on the selected value
    let selectedProduct = listProducts.find(p => p.id == value);
    if (selectedProduct) {
      // Check if product is created
      let result_search = orderData.Orders_Product?.find(element => element?.product_link == selectedProduct.id);

      if (result_search != undefined) {
        setProductDuplicated(true);
      }
      else {
        setProductDuplicated(false);
      }

      setProductData((prev) => ({
        ...prev,
        product_data: selectedProduct
      }));
    }

    // Add to the product_data the list of options available for this product
    loadGroupOptions(selectedProduct);

  };

  const loadGroupOptions = async (product) => {
    if (product && product.id) {
      try {
        const listProductGroups = await getProductGroupByProduct(product.id);

        // Usamos map con Promise.all y tu función centralizada
        const groupPromises = listProductGroups.map(async (productGroup) => {
          const listGroupOption = await getGroupOptionsByGroup(productGroup.group.id);

          let listOptions = [];
          listGroupOption.forEach(group_option => {
            group_option.option.add_price = Number(group_option.add_price);
            listOptions.push(group_option.option);
          });

          return {
            ...productGroup.group,
            is_multiple: productGroup.is_multiple,
            is_required: productGroup.is_required,
            option_select: productGroup.option_select,
            options: listOptions || []
          };
        });

        // Esperamos a que terminen todas las consultas de golpe
        const all_options = await Promise.all(groupPromises);
        setProductData((prev) => ({
          ...prev,
          list_options: all_options
        }));

        if (all_options.length == 0) {
          setCanAddToCart(true);
          setPrecioWithAdd(product.price);
          if (product.offer_price && Number(product.offer_price) > 0) {
            setPrecioWithAdd(product.offer_price);
          }
          setPrecioWithAdd(product.price);

          setSelectedGroupOptions({});
        }
        else {
          setCanAddToCart(false);
          setSelectedGroupOptions({});
        }

      } catch (error) {
        console.error("Error al cargar las opciones:", error);
      }
    }
  };

  const changeUnitProduct = async (orderProduct, unitsToChange) => {
    // Lógica para cambiar la cantidad de unidades de un producto
    let newUnits = orderProduct.units + unitsToChange;
    const resultUpdateOrderProduct = await updateOrderProduct(
      orderProduct.id,
      { units: newUnits }
    )

    // add price to ammount
    const priceChange = orderProduct.price * unitsToChange;
    const newAmount = formData.amount + priceChange;
    setFormData((prev) => ({
      ...prev,
      amount: newAmount
    }));
    await updateOrderDetails(id, { amount: newAmount });

    // Reload the order data
    const updatedOrder = await getOrderById(id);
    setOrderData(updatedOrder);
  }

  const checkIfTotalDiscrepancy = () => {
    // Recalculate the total from the products and compare with formData.amount
    const recalculatedTotal = getTotalCart();
    return recalculatedTotal !== formData.amount;
  }

  const getTotalCart = () => {
    // Recalculate the total from the products and compare with formData.amount

    const recalculatedTotal = orderData.Orders_Product.reduce((acc, product) => {
      let productTotal = product.price * product.units;
      return acc + productTotal;
    }, 0);
    return recalculatedTotal;
  }

  if (!orderData) return <div>Pedido no encontrado</div>;

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* CABECERA */}
      <div className="flex flex-wrap gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/administration/orders")}
            className="flex items-center justify-center w-10 h-10 bg-slate-50 text-slate-600 rounded-xl hover:bg-brand-primary hover:text-white transition-colors border border-slate-200"
          >
            <BsArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Pedido #{orderData.id}
              <span className="bg-brand-primary/10 text-brand-primary text-[10px] px-2 py-0.5 rounded-md font-bold border border-brand-primary/20 uppercase">
                {formData.order_status}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isEditMode ? "Modo edición" : "Modo consulta (solo lectura)"}
            </p>
          </div>
        </div>

        {!isEditMode ? (
          <button
            onClick={() => navigate(`/administration/orders/${id}/edit`)}
            className="bg-brand-green text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-md flex items-center gap-2"
          >
            <FaEdit size={16} /> Editar Pedido
          </button>
        ) : (
          <button
            onClick={saveChanges}
            disabled={isSaving}
            className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-brand-secondary transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <BsSave size={16} /> {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COLUMNA IZQ: DATOS DEL CLIENTE Y PEDIDO */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-6">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsPerson className="text-brand-primary" /> Datos del Cliente y Envío
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Nombre" name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Email" name="email" value={formData.email} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Teléfono" name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Fecha de Entrega" name="delivery_date" type="date" value={formData.delivery_date} onChange={handleInputChange} disabled={!isEditMode} />
              <InputField label="Lugar de Entrega" name="delivery_place" value={formData.delivery_place} onChange={handleInputChange} disabled={!isEditMode} span={2} type="textarea" />
            </div>
          </div>

          {/* LISTADO DE PRODUCTOS DEL PEDIDO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsListCheck className="text-brand-primary" /> Productos Solicitados ({orderData.Orders_Product?.length || 0})
            </h3>

            {formProductChangeVisible && (
              <div className="gap-1">
                <LabelTitle title="Asignar producto al pedido" />
                <div className="flex items-center justify-between w-full">
                  <select
                    name="product_id"
                    value={productData.product_id}
                    onChange={changeProductOption}
                    className="flex-1 items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 transition-all cursor-pointer"
                    disabled={formProductGroupInEditMode}
                  >
                    <option value="" disabled></option>
                    {/* Mapeo del catálogo de opciones */}
                    {listProducts?.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name + ` (${opt.price} €)`}
                      </option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Unidades"
                  name="units_product"
                  type="number"
                  value={productData.units_product}
                  onChange={changeUnitsProducts}
                />

                {productDuplicated == false && productData.list_options && productData.list_options.length === 0 && (
                  <span className="fw-bold text-primary small">Este producto no tiene opciones que seleccionar</span>
                )}

                {productDuplicated == true && productData.list_options && productData.list_options.length === 0 && (
                  <span className="fw-bold text-brand-red small">Este producto ya existe en el pedido, si quieres añadir unidades puedes hacerlo directamente sobre el producto ya existente.</span>
                )}

                {productDuplicated == true && productData.list_options && productData.list_options.length > 0 && (
                  <span className="fw-bold text-brand-red small">Este producto ya esta registrado en el pedido, en caso de querer mantener las mismas opciones que el ya existente puedes añadir unidades directamente sobre el producto ya existente.</span>
                )}

                {productData.list_options && productData.list_options.length > 0 && (
                  <OptionsProductSelect
                    productId={productData.product_id}
                    quantity={productData.units_product}
                    selectedGroupOptions={selectedGroupOptions}
                    setSelectedGroupOptions={setSelectedGroupOptions}
                    setPrecioWithAdd={setPrecioWithAdd}
                    setCanAddToCart={setCanAddToCart}
                  />
                )}
              </div>
            )}


            {isEditMode && (
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={addNewProduct}
                  className="flex-1 bg-brand-primary text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!canAddToCart && formProductChangeVisible}
                >
                  {formProductChangeVisible ?
                    `Añadir al pedido (${Number(precioWithAdd * productData.units_product).toFixed(2)} €)`
                    :
                    "Añadir Nuevo Producto"
                  }
                </button>
                {formProductChangeVisible && (
                  <button
                    type="button"
                    onClick={() => { setFormProductChangeVisible(false) }}
                    className="flex-1 bg-brand-red text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-brand-secondary transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-col gap-3">
              {orderData.Orders_Product?.map((product) => (
                <div key={product.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{product.name} <b>(x{product.units})</b></span>
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-brand-black small" style={{ fontSize: '0.60rem' }}>{product.price}€</span>
                      <span className="font-bold text-brand-primary">{product.units * product.price}€</span>

                      {!product.Orders_Options || product.Orders_Options.length == 0 && (
                        <>
                          {product.units > 1 && (
                            <button
                              onClick={() => { changeUnitProduct(product, -1) }}
                              className="items-center justify-end w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                              title="Eliminar unidad del producto"
                            >
                              <FiMinus size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => { changeUnitProduct(product, 1) }}
                            className="items-center justify-end w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                            title="Agregar unidad al producto"
                          >
                            <IoMdAdd size={16} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => { deleteProductCart(product) }}
                        className="items-center justify-end w-10 h-10 border-none bg-transparent hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
                        title="Eliminar"
                      >
                        <BsTrash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Opciones del producto */}
                  {product.Orders_Options && product.Orders_Options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex flex-col gap-3">
                      {/* Agrupamos las opciones por la propiedad 'group' */}
                      {Object.entries(
                        product.Orders_Options.reduce((acc, opt) => {
                          if (!acc[opt.group]) acc[opt.group] = [];
                          acc[opt.group].push(opt);
                          return acc;
                        }, {})
                      ).map(([groupName, options]) => (
                        <div key={groupName} className="flex flex-col gap-1.5">
                          {/* Título del grupo */}
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                            {groupName}
                          </span>

                          {/* Opciones del grupo */}
                          <div className="flex flex-wrap gap-2">
                            {options.map((opt, index) => (
                              <span key={opt.id} className="text-[10px] px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center gap-1">
                                {/* El índice ahora se reinicia por cada grupo */}
                                <b className="text-slate-400">{index + 1}:</b> {opt.option}
                                <span className="text-slate-500">({opt.units} uds)</span>
                                {opt.extra_price > 0 && (
                                  <span className="text-green-600 font-bold ml-1">+{opt.extra_price}€</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* COLUMNA DER: ESTADO FINANCIERO */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <BsBoxSeam className="text-brand-primary" /> Estado y Cobros
            </h3>

            <div className="flex flex-col gap-1.5">
              <LabelTitle title="Estado General" />
              <select
                name="order_status"
                value={formData.order_status}
                onChange={handleInputChange}
                disabled={!isEditMode}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all text-sm font-bold text-slate-800 disabled:opacity-60 cursor-pointer outline-none"
              >
                {ORDER_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <InputField
                  label="Total (€)"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  disabled={!isEditMode}
                />
                {checkIfTotalDiscrepancy() && (
                  <span className="fw-bold text-brand-red small">Existe un descuadre entre el total almacenado ({formData.amount.toFixed(2)}€) y el recalculado de los productos ({getTotalCart()}€)</span>
                )}
              </div>
              <InputField
                label="Pagado (€)"
                name="amount_paid"
                type="number"
                value={formData.amount_paid}
                onChange={handleInputChange}
                disabled={!isEditMode}
              />
            </div>

            {/* Calculadora visual de deuda */}
            <div className={`mt-2 p-3 rounded-xl border flex justify-between items-center ${formData.amount > formData.amount_paid ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
              <span className="text-xs font-bold text-slate-600">Restante:</span>
              <span className={`font-bold ${formData.amount > formData.amount_paid ? 'text-red-600' : 'text-green-600'}`}>
                {Math.max(0, formData.amount - formData.amount_paid).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrdersDetailAdmin;