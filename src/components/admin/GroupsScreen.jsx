// src/screens/GroupsScreen.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TableReusable from '../TableReusable';
import { getAllGroups, getProductGroupByGroup, deleteGroup } from '../../hooks/useGroups';
import { getGroupOptionsByGroup, deleteGroupOptionByGroup } from '../../hooks/useOptions';

const GroupsScreen = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Carga de datos usando la función pura
  const loadGroups = async () => {
    setLoading(true);
    try {
      let data = await getAllGroups();
      addNumOptionsHasGroup(data)
    } catch (error) {
      console.error("Error al cargar productos:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResumeOptionsByListOption = (listOptionGroup) => {
    // En lugar de concatenar un string, devolvemos un array con cada opción
    return listOptionGroup.map(optionGroup => {
      const priceText = optionGroup.add_price > 0 ? ` (+${optionGroup.add_price}€)` : "";
      return optionGroup.option.name + priceText;
    });
  }

  const addNumOptionsHasGroup = async (listGroup) => {
    let listGroupAllInformation = [];
    for (const group of listGroup) {
      let listOptionGroupByGroup = await getGroupOptionsByGroup(group.id);
      let string_options = getResumeOptionsByListOption(listOptionGroupByGroup)
      listGroupAllInformation.push({
        id: group.id,
        name: group.name,
        numOptions: listOptionGroupByGroup.length,
        options_list: string_options
      })
    }
    setGroups(listGroupAllInformation);
  }

  useEffect(() => {
    loadGroups();
  }, []);

  // 2. Configuración de columnas para la tabla reutilizable
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
      header: 'Numero de Opciones',
      render: (row) => (
        <div className="flex items-center gap-4">
          <span className="font-bold text-brand-dark whitespace-nowrap">
            {row.numOptions}
          </span>
        </div>
      )
    },
    {
      header: 'Resumen de Opciones',
      render: (row) => (
        // flex-wrap permite que las "píldoras" salten a la siguiente línea si no caben
        <div className="flex items-center flex-wrap gap-1.5 max-w-xs">
          {row.options_list.length > 0 ? (
            row.options_list.map((optionText, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600 rounded-md"
              >
                {optionText}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Sin opciones</span>
          )}
        </div>
      )
    }
  ];

  // 3. Controladores de acciones (Redirecciones y Borrado Lógico)
  const handleEdit = (group) => {
    navigate(`/administration/option-group/${group.id}/edit`);
  };

  const handleDelete = async (group) => {
    const listProducts = await getProductGroupByGroup(group.id);

    if (listProducts.length > 0) {
      alert(`No se puede eliminar el grupo "${group.name}" porque está asociado a ${listProducts.length} producto(s). Por favor, elimina primero las asociaciones: \n ${listProducts.map(p => `- ${p.product.name}`).join('\n')}`);
      return;
    }

    if (window.confirm(`¿Estás seguro de que deseas eliminar el grupo "${group.name}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteGroupOptionByGroup(group.id);
        await deleteGroup(group.id);
        alert("✅ Grupo eliminado correctamente.");
        loadGroups();
      } catch (error) {
        console.error("Error al eliminar el grupo:", error);
        alert("❌ Hubo un error al eliminar el grupo.");
      }
    }
    
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-light p-2">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark mb-1">Inventario de Grupos</h1>
        </div>
        <button
          onClick={() => navigate('/administration/option-group/nuevo')}
          className="bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all shadow-lg hover:shadow-brand-primary/30 flex items-center gap-2"
        >
          <span className="text-xl">+</span> Nuevo Grupo
        </button>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-light flex justify-center items-center">
          <div className="text-brand-primary font-bold animate-pulse">Cargando catálogo...</div>
        </div>
      ) : (
        <TableReusable
          columns={groupsColumns}
          data={groups}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default GroupsScreen;