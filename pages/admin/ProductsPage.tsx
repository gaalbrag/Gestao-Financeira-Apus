import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import ProductNodeDisplay from '../../components/ui/ProductNodeDisplay'; // New component
import Button from '../../components/ui/Button';
import { ICONS } from '../../constants';
import { ProductNode } from '../../types';
import InputField from '../../components/ui/InputField'; // For root node addition form

const ProductsPage: React.FC = () => {
  const { productNodes, addProductNode, updateProductNode, deleteProductNode } = useData();
  const [showAddRootForm, setShowAddRootForm] = useState(false);
  const [newRootProductName, setNewRootProductName] = useState('');
  const [newRootProductUnit, setNewRootProductUnit] = useState('');

  const handleAddRootNodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRootProductName.trim()) {
      addProductNode(newRootProductName.trim(), newRootProductUnit.trim(), null);
      setNewRootProductName('');
      setNewRootProductUnit('');
      setShowAddRootForm(false);
    } else {
      alert("O nome do produto/categoria raiz não pode ser vazio.");
    }
  };

  const handleAddChild = (parentId: string, name: string, unit: string) => {
    addProductNode(name, unit, parentId);
  };

  const handleEditNode = (nodeId: string, newName: string, newUnit: string) => {
    updateProductNode(nodeId, newName, newUnit);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este produto/categoria e todos os seus filhos? Esta ação não pode ser desfeita.")) {
      const nodeToDelete = findNodeRecursive(productNodes, nodeId);
      if (nodeToDelete && nodeToDelete.children.length > 0) {
        if (!window.confirm("Este item possui sub-itens. Excluí-lo também excluirá todos os sub-itens. Continuar?")) {
          return;
        }
      }
      deleteProductNode(nodeId);
    }
  };

  const findNodeRecursive = (nodes: ProductNode[], id: string): ProductNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children) {
        const found = findNodeRecursive(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Produtos e Categorias</h1>
        <Button onClick={() => setShowAddRootForm(true)} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Produto/Categoria Raiz
        </Button>
      </div>

      {showAddRootForm && (
        <form onSubmit={handleAddRootNodeSubmit} className="mb-6 p-4 bg-gray-100 rounded-lg shadow space-y-3">
          <h3 className="text-lg font-medium text-primary-dark">Novo Produto/Categoria Raiz</h3>
          <InputField
            label="Nome do Produto/Categoria Raiz"
            value={newRootProductName}
            onChange={(e) => setNewRootProductName(e.target.value)}
            placeholder="Ex: Ferragens"
            required
            autoFocus
          />
          <InputField
            label="Unidade (deixe em branco se for uma categoria)"
            value={newRootProductUnit}
            onChange={(e) => setNewRootProductUnit(e.target.value)}
            placeholder="Ex: kg, pç, m²"
          />
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddRootForm(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Adicionar Raiz</Button>
          </div>
        </form>
      )}

      <div className="bg-neutral-card p-4 rounded-lg shadow">
        {productNodes.length === 0 && !showAddRootForm ? (
          <p className="text-text-muted">Nenhum produto ou categoria definido. Clique em "Adicionar Produto/Categoria Raiz" para começar.</p>
        ) : (
          productNodes.map((rootNode) => (
            <ProductNodeDisplay
              key={rootNode.id}
              node={rootNode}
              level={0}
              onAddChild={handleAddChild}
              onEditNode={handleEditNode}
              onDeleteNode={handleDeleteNode}
              isRoot={true} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsPage;