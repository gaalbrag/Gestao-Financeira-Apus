import React, { useState, ReactNode } from 'react';
import { useData } from '../../contexts/DataContext';
import { RevenueCategory } from '../../types';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import InputField from '../../components/ui/InputField';
import Table from '../../components/ui/Table';
import { ICONS } from '../../constants';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  headerClassName?: string;
}

const RevenueCategoriesPage: React.FC = () => {
  const { revenueCategories, addRevenueCategory, updateRevenueCategory, deleteRevenueCategory } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Partial<RevenueCategory> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const openModalForNew = () => {
    setCurrentCategory({ name: '' });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (category: RevenueCategory) => {
    setCurrentCategory(category);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCategory(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentCategory) {
      setCurrentCategory({ ...currentCategory, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCategory && currentCategory.name) {
      if (isEditing && currentCategory.id) {
        updateRevenueCategory(currentCategory as RevenueCategory);
      } else {
        addRevenueCategory(currentCategory as Omit<RevenueCategory, 'id'>);
      }
      closeModal();
    } else {
      alert("Por favor, preencha o nome da categoria de receita.");
    }
  };

  const handleDelete = (id: string) => {
    // Consider adding a check if the category is in use before deleting
    if (window.confirm('Tem certeza que deseja excluir esta categoria de receita?')) {
      deleteRevenueCategory(id);
    }
  };

  const columns: Column<RevenueCategory>[] = [
    { header: 'Nome da Categoria', accessor: (item: RevenueCategory) => item.name },
    {
      header: 'Ações',
      accessor: (item: RevenueCategory) => (
        <div className="space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openModalForEdit(item)} leftIcon={ICONS.EDIT}>Editar</Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)} leftIcon={ICONS.DELETE}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-neutral-bg min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">Gerenciar Categorias de Receita</h1>
        <Button onClick={openModalForNew} variant="primary" leftIcon={ICONS.ADD}>
          Adicionar Categoria
        </Button>
      </div>

      <Table<RevenueCategory> columns={columns} data={revenueCategories} emptyStateMessage="Nenhuma categoria de receita encontrada."/>

      {isModalOpen && currentCategory && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={isEditing ? 'Editar Categoria de Receita' : 'Adicionar Nova Categoria de Receita'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Nome da Categoria"
              name="name"
              value={currentCategory.name || ''}
              onChange={handleChange}
              required
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="secondary" onClick={closeModal}>Cancelar</Button>
              <Button type="submit" variant="accent">{isEditing ? 'Salvar Alterações' : 'Adicionar Categoria'}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RevenueCategoriesPage;