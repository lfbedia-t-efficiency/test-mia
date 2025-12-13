
import React, { useState, useRef, DragEvent } from 'react';
import { Plant, Process, Subprocess } from '../types';
import { GripVerticalIcon, PlusIcon, XIcon, TrashIcon } from '../components/icons/Icons';

type ModalType = 'plant' | 'process' | 'subprocess';
interface ModalState {
  isOpen: boolean;
  type: ModalType | null;
  parentId?: string | null;
}
interface DeleteState {
  isOpen: boolean;
  step: 1 | 2;
  itemType: ModalType | null;
  itemId: string | null;
  itemName: string;
  parentId?: string | null;
}

interface PlantsProcessProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
}

const CreateModal: React.FC<{ modalState: ModalState; onClose: () => void; onSubmit: (type: ModalType, data: any, parentId?: string | null) => void; }> = ({ modalState, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<any>({});

  if (!modalState.isOpen) return null;

  const titles: Record<ModalType, string> = {
    plant: 'Crear Nueva Planta',
    process: 'Crear Nuevo Proceso',
    subprocess: 'Crear Nuevo Subproceso',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState.type) {
      onSubmit(modalState.type, formData, modalState.parentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">{titles[modalState.type!]}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre" onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {modalState.type === 'plant' && <input type="text" name="location" placeholder="Ubicación" onChange={handleChange} required className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />}
          <textarea name="description" placeholder="Descripción" onChange={handleChange} required rows={3} className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<{
    deleteState: DeleteState;
    onClose: () => void;
    onConfirmStep1: () => void;
    onFinalDelete: () => void;
  }> = ({ deleteState, onClose, onConfirmStep1, onFinalDelete }) => {
    if (!deleteState.isOpen) return null;
  
    const step1Text = `¿Desea borrar a "${deleteState.itemName}" junto con su información contenida?`;
    const step2Text = `Si procede a borrar "${deleteState.itemName}", la información dentro de "${deleteState.itemName}" se perderá. ¿Está seguro que desea continuar con este proceso?`;
  
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">{deleteState.step === 1 ? 'Confirmar Borrado' : 'Advertencia Final'}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
          </div>
          <p className="text-gray-600 mb-6">{deleteState.step === 1 ? step1Text : step2Text}</p>
          <div className="flex justify-end gap-3">
            {deleteState.step === 1 ? (
              <>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                <button type="button" onClick={onConfirmStep1} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Confirmar</button>
              </>
            ) : (
              <>
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                <button type="button" onClick={onFinalDelete} className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 font-semibold">Proceder a borrar</button>
              </>
            )}
          </div>
        </div>
      </div>
    );
};


const PlantsProcess: React.FC<PlantsProcessProps> = ({ plants, setPlants }) => {
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, type: null, parentId: null });
  const [deleteState, setDeleteState] = useState<DeleteState>({ isOpen: false, step: 1, itemType: null, itemId: null, itemName: '', parentId: null });
  const dragItem = useRef<any>(null);
  const dragOverItem = useRef<any>(null);

  const handleDragStart = (e: DragEvent, item: any, type: string, parentId?: string) => {
    dragItem.current = { item, type, parentId };
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnter = (e: DragEvent, item: any, type: string, parentId?: string) => {
    dragOverItem.current = { item, type, parentId };
  };

  const handleDragEnd = () => {
    const dragged = dragItem.current;
    const target = dragOverItem.current;
    
    if(!dragged || !target || dragged.item.id === target.item.id || dragged.type !== target.type || dragged.parentId !== target.parentId) {
        dragItem.current = null;
        dragOverItem.current = null;
        return;
    }

    const newPlants = JSON.parse(JSON.stringify(plants));

    if(dragged.type === 'plant') {
      const draggedIndex = newPlants.findIndex((p: Plant) => p.id === dragged.item.id);
      const targetIndex = newPlants.findIndex((p: Plant) => p.id === target.item.id);
      const [removed] = newPlants.splice(draggedIndex, 1);
      newPlants.splice(targetIndex, 0, removed);
    } else if (dragged.type === 'process') {
      const plant = newPlants.find((p: Plant) => p.id === dragged.parentId);
      const draggedIndex = plant.processes.findIndex((p: Process) => p.id === dragged.item.id);
      const targetIndex = plant.processes.findIndex((p: Process) => p.id === target.item.id);
      const [removed] = plant.processes.splice(draggedIndex, 1);
      plant.processes.splice(targetIndex, 0, removed);
    } else if (dragged.type === 'subprocess') {
      const [plantId, procId] = dragged.parentId.split('/');
      const plant = newPlants.find((p: Plant) => p.id === plantId);
      const process = plant.processes.find((p: Process) => p.id === procId);
      const draggedIndex = process.subprocesses.findIndex((sp: Subprocess) => sp.id === dragged.item.id);
      const targetIndex = process.subprocesses.findIndex((sp: Subprocess) => sp.id === target.item.id);
      const [removed] = process.subprocesses.splice(draggedIndex, 1);
      process.subprocesses.splice(targetIndex, 0, removed);
    }
    
    setPlants(newPlants);
    dragItem.current = null;
    dragOverItem.current = null;
  };
  

  const openModal = (type: ModalType, parentId?: string | null) => {
    setModalState({ isOpen: true, type, parentId });
  };

  const handleCreate = (type: ModalType, data: any, parentId?: string | null) => {
    const newItem = { id: `${type}-${Date.now()}`, ...data, machines: [] };
    const newPlants = JSON.parse(JSON.stringify(plants));
    
    if(type === 'plant') {
        newPlants.push({ ...newItem, processes: [] });
    } else if (type === 'process' && parentId) {
        const plant = newPlants.find((p: Plant) => p.id === parentId);
        if (plant) plant.processes.push({ ...newItem, subprocesses: [] });
    } else if (type === 'subprocess' && parentId) {
        const [plantId, procId] = parentId.split('/');
        const plant = newPlants.find((p: Plant) => p.id === plantId);
        const process = plant?.processes.find((p: Process) => p.id === procId);
        if (process) process.subprocesses.push(newItem);
    }

    setPlants(newPlants);
    setModalState({ isOpen: false, type: null, parentId: null });
  };

  const handleOpenDeleteModal = (itemType: ModalType, itemId: string, itemName: string, parentId?: string) => {
    setDeleteState({ isOpen: true, step: 1, itemType, itemId, itemName, parentId });
  };

  const handleCloseDeleteModal = () => {
    setDeleteState({ isOpen: false, step: 1, itemType: null, itemId: null, itemName: '', parentId: null });
  };

  const handleAdvanceDeleteStep = () => {
    setDeleteState(prev => ({ ...prev, step: 2 }));
  };

  const handleExecuteDelete = () => {
    const { itemType, itemId, parentId } = deleteState;
    let newPlants = JSON.parse(JSON.stringify(plants));

    if (itemType === 'plant') {
      newPlants = newPlants.filter((p: Plant) => p.id !== itemId);
    } else if (itemType === 'process' && parentId) {
      const plant = newPlants.find((p: Plant) => p.id === parentId);
      if (plant) {
        plant.processes = plant.processes.filter((proc: Process) => proc.id !== itemId);
      }
    } else if (itemType === 'subprocess' && parentId) {
      const [plantId, procId] = parentId.split('/');
      const plant = newPlants.find((p: Plant) => p.id === plantId);
      if (plant) {
        const process = plant.processes.find((proc: Process) => proc.id === procId);
        if (process) {
          process.subprocesses = process.subprocesses.filter((sub: Subprocess) => sub.id !== itemId);
        }
      }
    }
    
    setPlants(newPlants);
    handleCloseDeleteModal();
  };

  const ItemHeader: React.FC<{ onAdd: () => void; addLabel: string }> = ({ onAdd, addLabel }) => (
    <button onClick={onAdd} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
      <PlusIcon className="w-4 h-4" /> {addLabel}
    </button>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Plantas y Procesos</h3>
          <p className="text-gray-500 mt-1">Punto de control de la arquitectura operativa del sistema.</p>
        </div>
        <button onClick={() => openModal('plant')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Crear Planta
        </button>
      </div>

      <div className="space-y-4">
        {plants.map(plant => (
          <div key={plant.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 group"
            onDragEnter={(e) => handleDragEnter(e, plant, 'plant')}
            onDragEnd={handleDragEnd}
            onDragOver={e => e.preventDefault()}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="cursor-move text-gray-400" draggable onDragStart={(e) => handleDragStart(e, plant, 'plant')}>
                  <GripVerticalIcon />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{plant.name} <span className="text-sm font-normal text-gray-500">- {plant.location}</span></h4>
                  <p className="text-sm text-gray-600">{plant.description}</p>
                </div>
              </div>
              <div className="flex items-center">
                <ItemHeader onAdd={() => openModal('process', plant.id)} addLabel="+ Proceso" />
                 <button onClick={() => handleOpenDeleteModal('plant', plant.id, plant.name)} className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pl-12 mt-4 space-y-3">
              {plant.processes.map(process => (
                <div key={process.id} className="bg-white border border-gray-200 rounded-md p-3 group/process"
                 onDragEnter={(e) => handleDragEnter(e, process, 'process', plant.id)}
                 onDragEnd={handleDragEnd}
                 onDragOver={e => e.preventDefault()}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="cursor-move text-gray-400" draggable onDragStart={(e) => handleDragStart(e, process, 'process', plant.id)}>
                        <GripVerticalIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700">{process.name}</h5>
                        <p className="text-xs text-gray-500">{process.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                        <ItemHeader onAdd={() => openModal('subprocess', `${plant.id}/${process.id}`)} addLabel="+ Subproceso" />
                        <button onClick={() => handleOpenDeleteModal('process', process.id, process.name, plant.id)} className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover/process:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                  <div className="pl-10 mt-3 space-y-2">
                    {process.subprocesses.map(subprocess => (
                      <div key={subprocess.id} className="border-l-2 border-gray-200 pl-3 py-1 flex items-center justify-between gap-3 group/subprocess"
                        onDragEnter={(e) => handleDragEnter(e, subprocess, 'subprocess', `${plant.id}/${process.id}`)}
                        onDragEnd={handleDragEnd}
                        onDragOver={e => e.preventDefault()}>
                         <div className="flex items-center gap-3">
                            <div className="cursor-move text-gray-400" draggable onDragStart={(e) => handleDragStart(e, subprocess, 'subprocess', `${plant.id}/${process.id}`)}>
                                <GripVerticalIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">{subprocess.name}</p>
                               <p className="text-xs text-gray-400">{subprocess.description}</p>
                            </div>
                         </div>
                         <button onClick={() => handleOpenDeleteModal('subprocess', subprocess.id, subprocess.name, `${plant.id}/${process.id}`)} className="text-red-500 hover:text-red-700 opacity-0 group-hover/subprocess:opacity-100 transition-opacity">
                            <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <CreateModal modalState={modalState} onClose={() => setModalState({ isOpen: false, type: null, parentId: null })} onSubmit={handleCreate} />
      <DeleteConfirmationModal
        deleteState={deleteState}
        onClose={handleCloseDeleteModal}
        onConfirmStep1={handleAdvanceDeleteStep}
        onFinalDelete={handleExecuteDelete}
      />
    </div>
  );
};

export default PlantsProcess;
