import React, { useState } from 'react';
import { CostCenterNode } from '../../types';
import { ICONS } from '../../constants';
import Button from './Button';
import InputField from './InputField';

interface CostCenterNodeDisplayProps {
  node: CostCenterNode;
  level: number;
  onAddChild: (parentId: string, name: string) => void;
  onEditNode: (nodeId: string, newName: string, isLaunchable: boolean) => void;
  onDeleteNode: (nodeId: string) => void;
  isRoot?: boolean; // To disable delete for root items if needed
}

const CostCenterNodeDisplay: React.FC<CostCenterNodeDisplayProps> = ({
  node,
  level,
  onAddChild,
  onEditNode,
  onDeleteNode,
  isRoot = false,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');
  const [editNodeName, setEditNodeName] = useState(node.name);
  const [editNodeIsLaunchable, setEditNodeIsLaunchable] = useState(node.isLaunchable);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNodeName.trim()) {
      onAddChild(node.id, newNodeName.trim());
      setNewNodeName('');
      setIsAdding(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editNodeName.trim()) {
      onEditNode(node.id, editNodeName.trim(), editNodeIsLaunchable);
    }
    setIsEditing(false);
  };

  const openEditModal = () => {
    setEditNodeName(node.name);
    setEditNodeIsLaunchable(node.isLaunchable);
    setIsEditing(true);
  }

  return (
    <div className={`py-1 ${level > 0 ? 'pl-6' : ''}`}>
      <div className="flex items-center justify-between p-2 bg-neutral-card hover:bg-gray-50 rounded-md border border-neutral-light-gray mb-1">
        <div className="flex items-center">
          {node.children && node.children.length > 0 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 text-primary-dark">
              {isExpanded ? ICONS.CHEVRON_DOWN : ICONS.CHEVRON_RIGHT}
            </button>
          )}
          <span className="text-text-dark font-medium">{node.name}</span>
          {node.isLaunchable && <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Lançável</span>}
        </div>
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} title="Adicionar Filho">
            {ICONS.ADD}
          </Button>
          <Button variant="ghost" size="sm" onClick={openEditModal} title="Editar Nó">
            {ICONS.EDIT}
          </Button>
          {!isRoot && ( 
             <Button variant="ghost" size="sm" onClick={() => onDeleteNode(node.id)} title="Excluir Nó" className="text-red-500 hover:text-red-700">
                {ICONS.DELETE}
             </Button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddSubmit} className="ml-6 my-2 p-3 bg-gray-50 rounded-md border border-neutral-light-gray">
          <InputField
            label="Nome do Novo Filho"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Ex: Sub-categoria"
            autoFocus
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">Adicionar</Button>
          </div>
        </form>
      )}

      {isEditing && (
        <form onSubmit={handleEditSubmit} className="ml-6 my-2 p-3 bg-gray-50 rounded-md border border-neutral-light-gray">
          <InputField
            label="Editar Nome do Nó"
            value={editNodeName}
            onChange={(e) => setEditNodeName(e.target.value)}
            autoFocus
          />
          <div className="flex items-center mt-3 mb-2">
            <input
              type="checkbox"
              id={`isLaunchable-${node.id}`}
              checked={editNodeIsLaunchable}
              onChange={(e) => setEditNodeIsLaunchable(e.target.checked)}
              className="h-4 w-4 text-secondary-accent border-gray-300 rounded focus:ring-secondary-accent"
            />
            <label htmlFor={`isLaunchable-${node.id}`} className="ml-2 text-sm text-text-dark">
              É lançável (custo final)?
            </label>
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">Salvar</Button>
          </div>
        </form>
      )}

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child) => (
            <CostCenterNodeDisplay
              key={child.id}
              node={child}
              level={level + 1}
              onAddChild={onAddChild}
              onEditNode={onEditNode}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CostCenterNodeDisplay;