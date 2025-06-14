import React, { useState } from 'react';
import { ProductNode } from '../../types';
import { ICONS } from '../../constants';
import Button from './Button';
import InputField from './InputField';

interface ProductNodeDisplayProps {
  node: ProductNode;
  level: number;
  onAddChild: (parentId: string, name: string, unit: string) => void;
  onEditNode: (nodeId: string, newName: string, newUnit: string) => void;
  onDeleteNode: (nodeId: string) => void;
  isRoot?: boolean;
}

const ProductNodeDisplay: React.FC<ProductNodeDisplayProps> = ({
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
  const [newNodeUnit, setNewNodeUnit] = useState('');
  const [editNodeName, setEditNodeName] = useState(node.name);
  const [editNodeUnit, setEditNodeUnit] = useState(node.unit);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNodeName.trim()) {
      onAddChild(node.id, newNodeName.trim(), newNodeUnit.trim());
      setNewNodeName('');
      setNewNodeUnit('');
      setIsAdding(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editNodeName.trim()) {
      onEditNode(node.id, editNodeName.trim(), editNodeUnit.trim());
    }
    setIsEditing(false);
  };
  
  const openEditModal = () => {
    setEditNodeName(node.name);
    setEditNodeUnit(node.unit);
    setIsEditing(true);
  };

  const isCategory = !node.unit || node.unit.trim() === '';

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
          {!isCategory && <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">Un: {node.unit}</span>}
          {isCategory && node.children.length === 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded-full">Categoria Vazia</span>}
          {isCategory && node.children.length > 0 && <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full">Categoria</span>}
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
        <form onSubmit={handleAddSubmit} className="ml-6 my-2 p-3 bg-gray-50 rounded-md border border-neutral-light-gray space-y-3">
          <InputField
            label="Nome do Novo Produto/Categoria"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="Ex: Parafusos"
            autoFocus
            required
          />
          <InputField
            label="Unidade (deixe em branco se for categoria)"
            value={newNodeUnit}
            onChange={(e) => setNewNodeUnit(e.target.value)}
            placeholder="Ex: kg, pç, m²"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">Adicionar</Button>
          </div>
        </form>
      )}

      {isEditing && (
        <form onSubmit={handleEditSubmit} className="ml-6 my-2 p-3 bg-gray-50 rounded-md border border-neutral-light-gray space-y-3">
          <InputField
            label="Editar Nome"
            value={editNodeName}
            onChange={(e) => setEditNodeName(e.target.value)}
            autoFocus
            required
          />
          <InputField
            label="Editar Unidade (deixe em branco se for categoria)"
            value={editNodeUnit}
            onChange={(e) => setEditNodeUnit(e.target.value)}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsEditing(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" size="sm">Salvar</Button>
          </div>
        </form>
      )}

      {isExpanded && node.children && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child) => (
            <ProductNodeDisplay
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

export default ProductNodeDisplay;